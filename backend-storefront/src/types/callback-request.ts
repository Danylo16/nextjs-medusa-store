export type WeekDayValue = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

export const WEEK_DAYS: Array<{ value: WeekDayValue; label: string }> = [
  { value: "mon", label: "Понеділок" },
  { value: "tue", label: "Вівторок" },
  { value: "wed", label: "Середа" },
  { value: "thu", label: "Четвер" },
  { value: "fri", label: "П’ятниця" },
  { value: "sat", label: "Субота" },
  { value: "sun", label: "Неділя" },
]

export type TimeSlotValue = "09-12" | "12-15" | "15-18" | "18-21"

export const TIME_SLOTS: Array<{ value: TimeSlotValue; label: string }> = [
  { value: "09-12", label: "09:00–12:00" },
  { value: "12-15", label: "12:00–15:00" },
  { value: "15-18", label: "15:00–18:00" },
  { value: "18-21", label: "18:00–21:00" },
]

export type CallbackRequestPayload = {
  phone: string
  name?: string
  day: WeekDayValue
  time_slot: TimeSlotValue
  comment?: string
  consent: boolean
}

export type CallbackRequestResult =
  | { ok: true }
  | { ok: false; message: string }
