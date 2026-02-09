"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeCartId,
  setCartId,
} from "./cookies"
import { cookies, headers } from "next/headers"

import { getRegion } from "./regions"
import { listCartPaymentMethods } from "./payment"

/**
 * Retrieves a cart by its ID. If no ID is provided, it will use the cart ID from the cookies.
 */
export async function retrieveCart(cartId?: string, fields?: string) {
  const id = cartId || (await getCartId())
  fields ??=
    "*items, *region, *items.product, *items.variant, *items.thumbnail, *items.metadata, +items.total, *promotions, +shipping_methods.name"

  if (!id) return null

  const headers = { ...(await getAuthHeaders()) }
  const next = { ...(await getCacheOptions("carts")) }

  return await sdk.client
    .fetch<HttpTypes.StoreCartResponse>(`/store/carts/${id}`, {
      method: "GET",
      query: { fields },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ cart }: { cart: HttpTypes.StoreCart }) => cart)
    .catch(() => null)
}

export async function getOrSetCart(countryCode: string) {
  const region = await getRegion(countryCode)
  if (!region) throw new Error(`Region not found for country code: ${countryCode}`)

  let cart = await retrieveCart(undefined, "id,region_id")
  const headers = { ...(await getAuthHeaders()) }

  if (!cart) {
    const cartResp = await sdk.store.cart.create({ region_id: region.id }, {}, headers)
    cart = cartResp.cart

    await setCartId(cart.id)
    revalidateTag(await getCacheTag("carts"))
  }

  if (cart && cart?.region_id !== region.id) {
    await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, headers)
    revalidateTag(await getCacheTag("carts"))
  }

  return cart
}

export async function updateCart(data: HttpTypes.StoreUpdateCart) {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No existing cart found, please create one before updating")

  const headers = { ...(await getAuthHeaders()) }

  return sdk.store.cart
    .update(cartId, data, {}, headers)
    .then(async ({ cart }: { cart: HttpTypes.StoreCart }) => {
      revalidateTag(await getCacheTag("carts"))
      revalidateTag(await getCacheTag("fulfillment"))
      return cart
    })
    .catch(medusaError)
}

export async function addToCart({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  if (!variantId) throw new Error("Missing variant ID when adding to cart")

  const cart = await getOrSetCart(countryCode)
  if (!cart) throw new Error("Error retrieving or creating cart")

  const headers = { ...(await getAuthHeaders()) }

  await sdk.store.cart
    .createLineItem(cart.id, { variant_id: variantId, quantity }, {}, headers)
    .then(async () => {
      revalidateTag(await getCacheTag("carts"))
      revalidateTag(await getCacheTag("fulfillment"))
    })
    .catch(medusaError)
}

export async function updateLineItem({ lineId, quantity }: { lineId: string; quantity: number }) {
  if (!lineId) throw new Error("Missing lineItem ID when updating line item")

  const cartId = await getCartId()
  if (!cartId) throw new Error("Missing cart ID when updating line item")

  const headers = { ...(await getAuthHeaders()) }

  await sdk.store.cart
    .updateLineItem(cartId, lineId, { quantity }, {}, headers)
    .then(async () => {
      revalidateTag(await getCacheTag("carts"))
      revalidateTag(await getCacheTag("fulfillment"))
    })
    .catch(medusaError)
}

export async function deleteLineItem(lineId: string) {
  if (!lineId) throw new Error("Missing lineItem ID when deleting line item")

  const cartId = await getCartId()
  if (!cartId) throw new Error("Missing cart ID when deleting line item")

  const headers = { ...(await getAuthHeaders()) }

  await sdk.store.cart
    .deleteLineItem(cartId, lineId, {}, headers)
    .then(async () => {
      revalidateTag(await getCacheTag("carts"))
      revalidateTag(await getCacheTag("fulfillment"))
    })
    .catch(medusaError)
}

export async function setShippingMethod({
  cartId,
  shippingMethodId,
}: {
  cartId: string
  shippingMethodId: string
}) {
  const headers = { ...(await getAuthHeaders()) }

  return sdk.store.cart
    .addShippingMethod(cartId, { option_id: shippingMethodId }, {}, headers)
    .then(async () => {
      revalidateTag(await getCacheTag("carts"))
    })
    .catch(medusaError)
}

export async function initiatePaymentSession(
  cart: HttpTypes.StoreCart,
  data: HttpTypes.StoreInitializePaymentSession
) {
  const headers = { ...(await getAuthHeaders()) }

  return sdk.store.payment
    .initiatePaymentSession(cart, data, {}, headers)
    .then(async (resp) => {
      revalidateTag(await getCacheTag("carts"))
      return resp
    })
    .catch(medusaError)
}

export async function applyPromotions(codes: string[]) {
  const cartId = await getCartId()
  if (!cartId) throw new Error("No existing cart found")

  const headers = { ...(await getAuthHeaders()) }

  return sdk.store.cart
    .update(cartId, { promo_codes: codes }, {}, headers)
    .then(async () => {
      revalidateTag(await getCacheTag("carts"))
      revalidateTag(await getCacheTag("fulfillment"))
    })
    .catch(medusaError)
}

export async function submitPromotionForm(_currentState: unknown, formData: FormData) {
  const code = formData.get("code") as string
  try {
    await applyPromotions([code])
  } catch (e: any) {
    return e.message
  }
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(_currentState: unknown, formData: FormData) {
  try {
    if (!formData) throw new Error("No form data found when setting addresses")
    const cartId = getCartId()
    if (!cartId) throw new Error("No existing cart found when setting addresses")

    const data = {
      shipping_address: {
        first_name: formData.get("shipping_address.first_name"),
        last_name: formData.get("shipping_address.last_name"),
        address_1: formData.get("shipping_address.address_1"),
        address_2: "",
        company: formData.get("shipping_address.company"),
        postal_code: formData.get("shipping_address.postal_code"),
        city: formData.get("shipping_address.city"),
        country_code: formData.get("shipping_address.country_code"),
        province: formData.get("shipping_address.province"),
        phone: formData.get("shipping_address.phone"),
      },
      email: formData.get("email"),
    } as any

    const sameAsBilling = formData.get("same_as_billing")
    if (sameAsBilling === "on") data.billing_address = data.shipping_address

    if (sameAsBilling !== "on")
      data.billing_address = {
        first_name: formData.get("billing_address.first_name"),
        last_name: formData.get("billing_address.last_name"),
        address_1: formData.get("billing_address.address_1"),
        address_2: "",
        company: formData.get("billing_address.company"),
        postal_code: formData.get("billing_address.postal_code"),
        city: formData.get("billing_address.city"),
        country_code: formData.get("billing_address.country_code"),
        province: formData.get("billing_address.province"),
        phone: formData.get("billing_address.phone"),
      }

    await updateCart(data)
  } catch (e: any) {
    return e.message
  }

  redirect(`/${formData.get("shipping_address.country_code")}/cart`)
}

/**
 * Default placeOrder (redirects) — залишаю, бо може бути ще десь використаний
 */
export async function placeOrder(cartId?: string) {
  const id = cartId || (await getCartId())
  if (!id) throw new Error("No existing cart found when placing an order")

  const headers = { ...(await getAuthHeaders()) }

  const cartRes = await sdk.store.cart
    .complete(id, {}, headers)
    .then(async (cartRes) => {
      revalidateTag(await getCacheTag("carts"))
      return cartRes
    })
    .catch(medusaError)

  if (cartRes?.type === "order") {
    const countryCode = cartRes.order.shipping_address?.country_code?.toLowerCase()
    revalidateTag(await getCacheTag("orders"))

    removeCartId()
    redirect(`/${countryCode}/order/${cartRes?.order.id}/confirmed`)
  }

  return cartRes.cart
}

export async function updateRegion(countryCode: string, currentPath: string) {
  const cartId = await getCartId()
  const region = await getRegion(countryCode)
  if (!region) throw new Error(`Region not found for country code: ${countryCode}`)

  if (cartId) {
    await updateCart({ region_id: region.id })
    revalidateTag(await getCacheTag("carts"))
  }

  revalidateTag(await getCacheTag("regions"))
  revalidateTag(await getCacheTag("products"))

  redirect(`/${countryCode}${currentPath}`)
}

export async function listCartOptions() {
  const cartId = await getCartId()
  const headers = { ...(await getAuthHeaders()) }
  const next = { ...(await getCacheOptions("shippingOptions")) }

  return await sdk.client.fetch<{ shipping_options: HttpTypes.StoreCartShippingOption[] }>(
    "/store/shipping-options",
    {
      query: { cart_id: cartId },
      next,
      headers,
      cache: "force-cache",
    }
  )
}

/* =========================
   CALLBACK (NO ONLINE PAYMENT)
   кнопка -> створюємо Order -> order.placed
========================= */

type LeadState = {
  status: "idle" | "success" | "error"
  message: string
  order_id?: string
  order_display_id?: string
}

function digitsOnly(s: string) {
  return s.replace(/[^\d]/g, "")
}

async function completeCartNoRedirect(cartId?: string) {
  const id = cartId || (await getCartId())
  if (!id) throw new Error("No existing cart found when completing")

  const headers = { ...(await getAuthHeaders()) }

  const cartRes = await sdk.store.cart
    .complete(id, {}, headers)
    .then(async (cartRes) => {
      revalidateTag(await getCacheTag("carts"))
      return cartRes
    })
    .catch(medusaError)

  if (cartRes?.type === "order") {
    revalidateTag(await getCacheTag("orders"))
    removeCartId()
    return cartRes.order
  }

  throw new Error("Cart was not completed (missing address/shipping/payment?)")
}

export async function submitCallbackOrder(
  _prev: LeadState,
  formData: FormData
): Promise<LeadState> {
  // Honeypot (bots)
  const trap = String(formData.get("website") ?? "").trim()
  if (trap) {
    return { status: "success", message: "Готово." } // bot thinks it succeeded
  }

  // Cooldown by cookie (per browser)
  const c = await cookies()
  const now = Date.now()
  const last = Number(c.get("lead_cd")?.value ?? 0)

  if (last && now - last < 45_000) {
    return { status: "error", message: "Занадто часто. Спробуй через хвилину." }
  }

  c.set("lead_cd", String(now), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60,
    path: "/",
  })

  // Soft rate limit by IP (best-effort)
  const h = await headers()
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "local"

  const winMs = 60_000
  const max = 8

  const entry = __rl.get(ip) ?? { ts: now, count: 0 }
  if (now - entry.ts > winMs) {
    entry.ts = now
    entry.count = 0
  }
  entry.count += 1
  __rl.set(ip, entry)

  if (entry.count > max) {
    return { status: "error", message: "Забагато запитів. Спробуй пізніше." }
  }

  const name = String(formData.get("name") ?? "").trim().slice(0, 80)
  const phoneRaw = String(formData.get("phone") ?? "").trim()
  const comment = String(formData.get("comment") ?? "").trim().slice(0, 500)
  const countryCode = String(formData.get("country_code") ?? "ua").toLowerCase()

  const phone = phoneRaw.replace(/[^\d+]/g, "")
  if (digitsOnly(phone).length < 10) {
    return { status: "error", message: "Введи нормальний номер телефону (мінімум 10 цифр)." }
  }

  const cart = await retrieveCart(
    undefined,
    "id,region_id,region.*,currency_code,email,shipping_methods.*,*items,+items.total"
  )
  if (!cart?.id || !cart.items?.length) {
    return { status: "error", message: "Кошик порожній." }
  }

  const regionId = cart.region_id || (cart.region as any)?.id
  if (!regionId) {
    return { status: "error", message: "Не бачу region_id у cart. Це вже дивно." }
  }

  // email обовʼязковий для order у Medusa — генеруємо технічний
  const email = cart.email || `lead+${digitsOnly(phone)}@mtb.local`

  try {
    // 1) записуємо контакт у cart (і мінімальну “адресу-заглушку”)
    await updateCart({
      email,
      metadata: {
        lead_type: "callback",
        lead_name: name || "",
        lead_phone: phone,
        lead_comment: comment || "",
      } as any,
      shipping_address: {
        first_name: name || "Клієнт",
        last_name: "",
        phone,
        address_1: "Уточнити",
        address_2: comment ? `Коментар: ${comment}` : "",
        city: "Уточнити",
        postal_code: "00000",
        country_code: countryCode,
        province: "",
      } as any,
      billing_address: {
        first_name: name || "Клієнт",
        last_name: "",
        phone,
        address_1: "Уточнити",
        address_2: "",
        city: "Уточнити",
        postal_code: "00000",
        country_code: countryCode,
        province: "",
      } as any,
    } as any)

    // 2) shipping option (беремо перший доступний)
    const fresh1 = await retrieveCart(undefined, "id,shipping_methods.*,*region,region_id")
    if (!fresh1?.shipping_methods?.length) {
      const opts = await listCartOptions()
      const first = opts?.shipping_options?.[0]
      if (!first?.id) {
        return {
          status: "error",
          message: "Немає shipping options у Medusa. Додай хоча б одну доставку.",
        }
      }
      await setShippingMethod({ cartId: cart.id, shippingMethodId: first.id })
    }

    // 3) payment provider: беремо manual якщо є, інакше перший доступний
    const providers = await listCartPaymentMethods(regionId)
    const providerId =
      providers?.find((p) => p.id === "manual")?.id || providers?.[0]?.id

    if (!providerId) {
      return {
        status: "error",
        message:
          "Немає payment providers для регіону. Увімкни manual/offline provider у бекенді і привʼяжи до регіону.",
      }
    }

    const fresh2 = await retrieveCart(undefined, "id,region_id,region.*,currency_code,email,shipping_methods.*")
    if (!fresh2?.id) throw new Error("Cart vanished")

    await initiatePaymentSession(fresh2, { provider_id: providerId } as any)

    // 4) complete -> order.placed
    const order = await completeCartNoRedirect(fresh2.id)
    
    // Build lightweight summary for the thank-you page (server-readable cookie).
    const summary = {
      display_id: order.display_id ?? null,
      currency_code: cart.currency_code,
      items: (cart.items ?? []).map((i: any) => ({
        id: i.id,
        title: i.title ?? i.product_title ?? "Товар",
        thumbnail: i.thumbnail ?? "",
        quantity: i.quantity ?? 1,
        unit_price: i.unit_price ?? null,
        total: i.total ?? null, // you already request +items.total
      })),
    }

    const encoded = Buffer.from(JSON.stringify(summary), "utf8").toString("base64url")

    const c2 = await cookies()
    c2.set("thanks_summary", encoded, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 5, // 5 minutes
      path: "/",
    })


    // IMPORTANT: redirect() throws NEXT_REDIRECT; must not be swallowed by catch
    const display = String(order.display_id ?? "")
    const q = display ? `?order=${encodeURIComponent(display)}` : ""
    redirect(`/${countryCode}/thanks`)

    // Unreachable, kept to satisfy typing in some environments
    return { status: "success", message: "OK" }
  } catch (e: any) {
    // IMPORTANT: Next redirect() throws; don't swallow it
    if (typeof e?.digest === "string" && e.digest.startsWith("NEXT_REDIRECT")) {
      throw e
    }

    return {
      status: "error",
      message:
        e?.message ||
        "Не вдалося створити замовлення. Перевір доставку/провайдера оплати (manual/offline) у Medusa.",
    }
  }
}

const __rl =
  (globalThis as any).__callback_rl ??
  new Map<string, { ts: number; count: number }>()
;(globalThis as any).__callback_rl = __rl
