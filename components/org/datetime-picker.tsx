"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatetimePickerProps {
  defaultValue?: Date
  onChange?: (datetime: Date) => void
}

export function DatetimePicker({ defaultValue, onChange }: DatetimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(defaultValue)
  const [time, setTime] = React.useState<string>(
    defaultValue ? 
      `${defaultValue.getHours().toString().padStart(2, '0')}:${defaultValue.getMinutes().toString().padStart(2, '0')}:${defaultValue.getSeconds().toString().padStart(2, '0')}` 
      : "10:30:00"
  )

  // Combine date and time and call onChange when either changes
  React.useEffect(() => {
    if (date && time && onChange) {
      const [hours, minutes, seconds] = time.split(':').map(Number)
      const combinedDateTime = new Date(date)
      combinedDateTime.setHours(hours, minutes, seconds, 0)
      onChange(combinedDateTime)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, time])

  return (
    <div className="flex gap-4">
      <div className="flex-1 flex flex-col gap-3">
        <Label htmlFor="date-picker" className="px-1">
          Date
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="justify-between font-normal"
            >
              {date ? date.toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={(date) => {
                setDate(date)
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex-1 flex flex-col gap-3">
        <Label htmlFor="time-picker" className="px-1">
          Time
        </Label>
        <Input
          type="time"
          id="time-picker"
          step="1"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  )
}
