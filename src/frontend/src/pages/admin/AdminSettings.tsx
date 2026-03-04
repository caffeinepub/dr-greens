import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetStoreSettings,
  useUpdateStoreSettings,
} from "@/hooks/useQueries";
import {
  Globe,
  Loader2,
  MapPin,
  MessageCircle,
  Package,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SettingsForm {
  whatsappNumber: string;
  businessAddress: string;
  deliveryZones: string;
  isStoreOpen: boolean;
  lowStockThreshold: string;
}

const defaultForm: SettingsForm = {
  whatsappNumber: "",
  businessAddress: "",
  deliveryZones: "",
  isStoreOpen: true,
  lowStockThreshold: "5",
};

export function AdminSettings() {
  const [form, setForm] = useState<SettingsForm>(defaultForm);
  const { data: settings, isLoading } = useGetStoreSettings();
  const updateSettings = useUpdateStoreSettings();

  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      setForm({
        whatsappNumber: settings.whatsappNumber,
        businessAddress: settings.businessAddress,
        deliveryZones: settings.deliveryZones,
        isStoreOpen: settings.isStoreOpen,
        lowStockThreshold: String(settings.lowStockThreshold),
      });
    }
  }, [settings]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const threshold = Number.parseInt(form.lowStockThreshold, 10);
    if (Number.isNaN(threshold) || threshold < 0) {
      toast.error("Low stock threshold must be a valid number.");
      return;
    }
    try {
      await updateSettings.mutateAsync({
        whatsappNumber: form.whatsappNumber.trim(),
        businessAddress: form.businessAddress.trim(),
        deliveryZones: form.deliveryZones.trim(),
        isStoreOpen: form.isStoreOpen,
        lowStockThreshold: BigInt(threshold),
      });
      toast.success("Settings saved successfully!");
    } catch {
      toast.error("Failed to save settings. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <div data-ocid="settings.loading_state" className="space-y-6">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeletons
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Store Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your store preferences and delivery options
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Status */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Store Status</h2>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
            <div>
              <Label
                htmlFor="store-open"
                className="text-sm font-semibold cursor-pointer"
              >
                Store is Open
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                When closed, customers will see a "Store Closed" banner and
                cannot order
              </p>
            </div>
            <Switch
              id="store-open"
              data-ocid="settings.store_open.switch"
              checked={form.isStoreOpen}
              onCheckedChange={(checked) =>
                setForm((p) => ({ ...p, isStoreOpen: checked }))
              }
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">WhatsApp</h2>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp-number" className="text-sm font-semibold">
              WhatsApp Number
            </Label>
            <Input
              id="whatsapp-number"
              data-ocid="settings.whatsapp.input"
              value={form.whatsappNumber}
              onChange={(e) =>
                setForm((p) => ({ ...p, whatsappNumber: e.target.value }))
              }
              placeholder="+919876543210"
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Include country code, e.g. +919876543210. This enables the
              WhatsApp chat button on the storefront.
            </p>
          </div>
        </div>

        {/* Business Address */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Business Info</h2>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="business-address" className="text-sm font-semibold">
              Business Address
            </Label>
            <Textarea
              id="business-address"
              data-ocid="settings.address.textarea"
              value={form.businessAddress}
              onChange={(e) =>
                setForm((p) => ({ ...p, businessAddress: e.target.value }))
              }
              placeholder="e.g. 123 Green Lane, Bangalore, Karnataka 560001"
              rows={3}
              className="rounded-xl resize-none"
            />
          </div>
        </div>

        {/* Delivery Zones */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">
              Delivery Zones
            </h2>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="delivery-zones" className="text-sm font-semibold">
              Delivery Pin Codes
            </Label>
            <Input
              id="delivery-zones"
              data-ocid="settings.delivery_zones.input"
              value={form.deliveryZones}
              onChange={(e) =>
                setForm((p) => ({ ...p, deliveryZones: e.target.value }))
              }
              placeholder="560001, 560002, 560003"
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of pin codes you deliver to.
            </p>
          </div>
        </div>

        {/* Low Stock Threshold */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Inventory</h2>
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="low-stock-threshold"
              className="text-sm font-semibold"
            >
              Low Stock Alert Threshold
            </Label>
            <Input
              id="low-stock-threshold"
              data-ocid="settings.low_stock.input"
              type="number"
              min="0"
              value={form.lowStockThreshold}
              onChange={(e) =>
                setForm((p) => ({ ...p, lowStockThreshold: e.target.value }))
              }
              className="rounded-xl max-w-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              Products with stock at or below this number will show a Low Stock
              alert on the dashboard.
            </p>
          </div>
        </div>

        {/* Save */}
        <Button
          data-ocid="settings.save.primary_button"
          type="submit"
          disabled={updateSettings.isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2 h-11 px-8 font-semibold"
        >
          {updateSettings.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save Settings"
          )}
        </Button>

        {updateSettings.isSuccess && (
          <p
            data-ocid="settings.success_state"
            className="text-sm text-emerald-600 font-medium"
          >
            ✓ Settings saved successfully
          </p>
        )}
        {updateSettings.isError && (
          <p
            data-ocid="settings.error_state"
            className="text-sm text-destructive font-medium"
          >
            Failed to save settings. Please try again.
          </p>
        )}
      </form>
    </div>
  );
}
