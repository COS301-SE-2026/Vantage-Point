import { Loader2 } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { GuideSection } from "./GuideSection";

const BUTTON_VARIANTS = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;

const BUTTON_SIZES = ["sm", "default", "lg"] as const;

export function ComponentsSection() {
  return (
    <GuideSection
      id="components"
      eyebrow="05. Components"
      title="Component library"
      description="Standard UI primitives from components/ui. Shows variants, sizes, and states."
      delayMs={200}
    >
      {/* Buttons */}
      <div className="mb-10 rounded-lg border border-border bg-white p-5 device-dark:border-[#2c2c2c] device-dark:bg-[#1e1e1e]">
        <h3 className="mb-1 font-['Inter',sans-serif] text-base font-semibold text-[#1e1e1e] device-dark:text-white">
          Button
        </h3>
        <p className="mb-4 font-['Inter',sans-serif] text-sm text-[#525252] device-dark:text-[#b7b7b7]">
          Variants: primary (default), secondary, outline, ghost, destructive,
          link. Sizes: sm, default, lg, icon.
        </p>

        <p className="mb-2 font-['Inter',sans-serif] text-xs font-semibold uppercase tracking-wide text-muted-foreground device-dark:text-[#929292]">
          Variants
        </p>
        <div className="mb-6 flex flex-wrap gap-2 rounded-md bg-[#f5f5f5] p-3 device-dark:bg-[#f5f5f5]">
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>

        <p className="mb-2 font-['Inter',sans-serif] text-xs font-semibold uppercase tracking-wide text-muted-foreground device-dark:text-[#929292]">
          Sizes
        </p>
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-md bg-[#f5f5f5] p-3 device-dark:bg-[#f5f5f5]">
          {BUTTON_SIZES.map((size) => (
            <Button key={size} size={size}>
              {size}
            </Button>
          ))}
          <Button size="icon" aria-label="Icon button example">
            <Loader2 />
          </Button>
        </div>

        <p className="mb-2 font-['Inter',sans-serif] text-xs font-semibold uppercase tracking-wide text-muted-foreground device-dark:text-[#929292]">
          States
        </p>
        <div className="flex flex-wrap items-center gap-2 rounded-md bg-[#f5f5f5] p-3 device-dark:bg-[#f5f5f5]">
          <Button>Default</Button>
          <Button className="hover:bg-primary/90">Hover (try me)</Button>
          <Button className="border-ring ring-ring/50 ring-[3px]">Focus</Button>
          <Button className="bg-primary/90">Active</Button>
          <Button disabled>Disabled</Button>
          <Button disabled>
            <Loader2 className="animate-spin" />
            Loading
          </Button>
          <Button
            variant="outline"
            aria-invalid
            className="aria-invalid:border-destructive aria-invalid:ring-destructive/20"
          >
            Error
          </Button>
        </div>
      </div>

      <div className="mb-10 rounded-lg border border-border p-5 device-dark:border-[#2c2c2c]">
        <h3 className="mb-1 font-['Inter',sans-serif] text-base font-semibold text-[#1e1e1e] device-dark:text-white">
          Auth primary CTA (custom via AuthScreen)
        </h3>
        <p className="mb-4 font-['Inter',sans-serif] text-sm text-[#525252] device-dark:text-[#b7b7b7]">
          Shared <code className="text-xs">AuthScreen</code> wraps login /
          register / Riot ID. Primary CTA: background{" "}
          <code className="text-xs">#2c2c2c</code>, label{" "}
          <code className="text-xs">#f5f5f5</code>; form surfaces follow{" "}
          <code className="text-xs">device-dark:</code>.
        </p>
        <button
          type="button"
          className="h-[58px] w-full max-w-sm rounded-lg bg-[#2c2c2c] font-['Inter',sans-serif] text-base font-medium text-[#f5f5f5] transition-colors hover:bg-[#3c3c3c] disabled:opacity-60"
        >
          Sign in
        </button>
      </div>

      <div className="mb-10 rounded-lg border border-border p-5 device-dark:border-[#2c2c2c]">
        <h3 className="mb-1 font-['Inter',sans-serif] text-base font-semibold text-[#1e1e1e] device-dark:text-white">
          ThemedIcon
        </h3>
        <p className="font-['Inter',sans-serif] text-sm text-[#525252] device-dark:text-[#b7b7b7]">
          Pair light + dark Figma SVG exports; swap with{" "}
          <code className="text-xs">device-dark:hidden</code> /{" "}
          <code className="text-xs">device-dark:block</code>. Used across
          profile metrics, replay toolbar, and dashboard chrome when stroke is
          baked into the asset.
        </p>
      </div>

      {/* Inputs */}
      <div className="mb-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-5 device-dark:border-[#2c2c2c]">
          <h3 className="mb-4 font-['Inter',sans-serif] text-base font-semibold text-[#1e1e1e] device-dark:text-white">
            Input
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sg-input-default" className="device-dark:text-white">
                Default
              </Label>
              <Input id="sg-input-default" placeholder="Summoner name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sg-input-disabled" className="device-dark:text-white">
                Disabled
              </Label>
              <Input id="sg-input-disabled" disabled placeholder="Disabled" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sg-input-error" className="device-dark:text-white">
                Error
              </Label>
              <Input
                id="sg-input-error"
                aria-invalid
                defaultValue="bad@"
                placeholder="Email"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border p-5 device-dark:border-[#2c2c2c]">
          <h3 className="mb-4 font-['Inter',sans-serif] text-base font-semibold text-[#1e1e1e] device-dark:text-white">
            Select
          </h3>
          <div className="space-y-2">
            <Label htmlFor="sg-select" className="device-dark:text-white">
              Queue type
            </Label>
            <Select defaultValue="ranked">
              <SelectTrigger id="sg-select" className="w-full">
                <SelectValue placeholder="Select queue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ranked">Ranked Solo</SelectItem>
                <SelectItem value="flex">Flex</SelectItem>
                <SelectItem value="aram">ARAM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Badges + Dialog + Toast note */}
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border p-5 device-dark:border-[#2c2c2c]">
          <h3 className="mb-4 font-['Inter',sans-serif] text-base font-semibold text-[#1e1e1e] device-dark:text-white">
            Badge
          </h3>
          <div className="flex flex-wrap gap-2">
            <Badge>default</Badge>
            <Badge variant="secondary">secondary</Badge>
            <Badge variant="outline">outline</Badge>
            <Badge variant="destructive">destructive</Badge>
          </div>
        </div>

        <div className="rounded-lg border border-border p-5 device-dark:border-[#2c2c2c]">
          <h3 className="mb-4 font-['Inter',sans-serif] text-base font-semibold text-[#1e1e1e] device-dark:text-white">
            Dialog (modal)
          </h3>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open modal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Link Riot ID</DialogTitle>
                <DialogDescription>
                  Confirm your Riot game name and tagline to sync match history.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Continue</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/40 p-5 device-dark:border-[#2c2c2c] device-dark:bg-[#2a2a2a]">
        <h3 className="mb-2 font-['Inter',sans-serif] text-base font-semibold text-[#1e1e1e] device-dark:text-white">
          Toast
        </h3>
        <p className="mb-4 font-['Inter',sans-serif] text-sm text-[#525252] device-dark:text-[#b7b7b7]">
          Toasts use Sonner (`components/ui/sonner.tsx`) with popover token
          colours. Typical states: default info, success, error.
        </p>
        <div className="flex max-w-sm flex-col gap-2">
          <div
            className="rounded-md border border-border bg-popover px-4 py-3 font-['Inter',sans-serif] text-sm text-popover-foreground shadow-md device-dark:border-[#2c2c2c]"
            role="status"
          >
            Match history updated.
          </div>
          <div
            className="rounded-md border border-destructive/30 bg-popover px-4 py-3 font-['Inter',sans-serif] text-sm text-destructive shadow-md"
            role="alert"
          >
            Couldn’t reach Riot. Try again.
          </div>
        </div>
      </div>
    </GuideSection>
  );
}
