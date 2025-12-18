import { defineMiddlewares } from "@medusajs/framework/http"

const deny = (req: any, res: any, next: any) => {
  console.log("BLOCK REGISTER HIT", req.method, req.path)

  return res.status(403).json({ message: "Customer registration is disabled" })
}

export default defineMiddlewares({
  routes: [
    {
      matcher: "/auth/customer/emailpass/register",
      method: "POST",
      middlewares: [deny],
    },
    {
      matcher: "/store/customers",
      method: "POST",
      middlewares: [deny],
    },
  ],
})
