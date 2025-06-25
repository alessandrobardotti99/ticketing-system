import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-neutral-600 mt-2">Configure your ticketing system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Default Priority</label>
              <Select defaultValue="medium">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Auto-assign Tickets</label>
              <div className="flex items-center space-x-2">
                <Checkbox id="auto-assign" defaultChecked />
                <label htmlFor="auto-assign" className="text-sm">
                  Automatically assign new tickets to available users
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="email-new" defaultChecked />
              <label htmlFor="email-new" className="text-sm">
                Email notifications for new tickets
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="email-updates" defaultChecked />
              <label htmlFor="email-updates" className="text-sm">
                Email notifications for ticket updates
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="daily-summary" />
              <label htmlFor="daily-summary" className="text-sm">
                Daily summary reports
              </label>
            </div>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Ticket Status Management</h3>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>💡 Tip:</strong> You can now manage ticket statuses directly from the Tickets page! Switch to the
              Kanban Board view to customize your workflow columns, colors, and order.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
