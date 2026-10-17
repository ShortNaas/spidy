import React from "react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { Input } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Chip";
import { DeltaBadge } from "@/components/ui/DeltaBadge";
import { Table } from "@/components/ui/Table";
import { Tooltip } from "@/components/ui/Tooltip";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Banner } from "@/components/ui/Banner";
import { Wordmark } from "@/components/ui/Wordmark";
import { Activity, Globe, Search, MoreHorizontal, ArrowRight } from "lucide-react";

export default function DevUiGalleryPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const sampleTableData = [
    { page: "/dashboard", views: 24500, share: 0.52 },
    { page: "/pricing", views: 12200, share: 0.26 },
    { page: "/features", views: 6800, share: 0.14 },
    { page: "/docs", views: 3600, share: 0.08 },
  ];

  const tableColumns = [
    { key: "page", header: "Path" },
    {
      key: "views",
      header: "Views",
      isNumeric: true,
      render: (r: { views: number }) => r.views.toLocaleString(),
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-text p-8 space-y-12 max-w-6xl mx-auto font-sans">
      <header className="border-b border-border pb-6 flex items-center justify-between">
        <div>
          <Wordmark href="" />
          <p className="text-[13px] text-muted mt-1">Design System Primitive Catalog (/dev/ui)</p>
        </div>
        <Tag>Design Tokens v3</Tag>
      </header>

      {/* 1. Buttons */}
      <section className="space-y-4">
        <h2 className="text-[18px] font-semibold text-white">1. Buttons (Pill Architecture)</h2>
        <div className="flex flex-wrap gap-4 items-center p-6 bg-surface border border-border rounded-3xl">
          <Button variant="primary">Primary Pill</Button>
          <Button variant="secondary">Secondary Pill</Button>
          <Button variant="ghost">Ghost Pill</Button>
          <Button variant="danger">Danger Pill</Button>
          <Button variant="icon" aria-label="Globe">
            <Globe size={18} />
          </Button>
          <Button variant="primary" disabled>
            Disabled Pill
          </Button>
        </div>
      </section>

      {/* 2. Tags & Badges */}
      <section className="space-y-4">
        <h2 className="text-[18px] font-semibold text-white">2. Tags & Status Chips</h2>
        <div className="flex flex-wrap gap-4 items-center p-6 bg-surface border border-border rounded-3xl">
          <Tag>Section Label</Tag>
          <Chip variant="neutral">Default Chip</Chip>
          <Chip variant="active" dot>
            LIVE · 34
          </Chip>
          <Chip variant="accent" dot>
            Featured
          </Chip>
          <Chip variant="positive" dot>
            Active
          </Chip>
          <Chip variant="danger" dot>
            Offline
          </Chip>
          <Chip variant="neutral" onRemove={() => {}}>
            Dismissible
          </Chip>
          <DeltaBadge value={18.4} />
          <DeltaBadge value={-6.2} />
          <DeltaBadge value={0} />
          <DeltaBadge value={null} isPreviousZero />
          <DeltaBadge value={null} />
          <DeltaBadge value={-4} invert />
        </div>
      </section>

      {/* 3. Tabs / Range Presets */}
      <section className="space-y-4">
        <h2 className="text-[18px] font-semibold text-white">3. Horizon Tabs (Segmented Pill Group)</h2>
        <div className="p-6 bg-surface border border-border rounded-3xl">
          <Tabs
            tabs={[
              { id: "24h", label: "24h" },
              { id: "7d", label: "7d" },
              { id: "30d", label: "30d" },
              { id: "12mo", label: "12mo" },
            ]}
            activeTab="7d"
            onChange={() => {}}
          />
        </div>
      </section>

      {/* 4. Form Inputs */}
      <section className="space-y-4">
        <h2 className="text-[18px] font-semibold text-white">4. Inputs & Field States</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-surface border border-border rounded-3xl">
          <Input label="Domain name" placeholder="acme.com" icon={<Search size={16} />} />
          <Input label="Site identifier" defaultValue="spidy-prod" hint="Generated automatically" />
          <Input label="Custom webhook" defaultValue="invalid-url" error="Must be a valid HTTPS endpoint" />
        </div>
      </section>

      {/* 5. Cards & KPI Cards */}
      <section className="space-y-4">
        <h2 className="text-[18px] font-semibold text-white">5. Cards & KPI Telemetry</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard
            label="Total Pageviews"
            value="148,290"
            deltaPct={12.4}
            sparklineData={[12, 18, 15, 24, 28, 22, 34]}
            subtext="vs previous 7 days"
          />
          <KpiCard
            label="Live Active Visitors"
            value="34"
            isLiveValue={true}
            subtext="Current 5-minute beacon window"
          />
          <Card
            title="Telemetry Stream"
            subtitle="Real-time page views"
            icon={<Activity size={18} />}
            action={
              <Button variant="icon" size="sm" aria-label="More options">
                <MoreHorizontal size={16} />
              </Button>
            }
            footerLink={
              <Button variant="ghost" size="sm">
                <span>View Full Telemetry</span>
                <ArrowRight size={14} className="ml-1" />
              </Button>
            }
          >
            <div className="py-6 text-center text-muted text-[13px]">
              Card inner container with .sheen and 24px radius.
            </div>
          </Card>
        </div>
      </section>

      {/* 6. Tables with Inline Hatched Share Bar */}
      <section className="space-y-4">
        <h2 className="text-[18px] font-semibold text-white">6. Telemetry Table (Hatched Share Bar)</h2>
        <div className="p-6 bg-surface border border-border rounded-3xl">
          <Table
            columns={tableColumns}
            data={sampleTableData}
            keyExtractor={(r) => r.page}
            showShareBar={true}
            getShareValue={(r) => r.share}
          />
        </div>
      </section>

      {/* 7. Tooltips & Skeletons */}
      <section className="space-y-4">
        <h2 className="text-[18px] font-semibold text-white">7. Tooltip, Skeleton & Banner</h2>
        <div className="space-y-4 p-6 bg-surface border border-border rounded-3xl">
          <Banner text="You are viewing demo data" actionText="Create your own" actionHref="/register" />
          <div className="flex items-center gap-6 pt-4">
            <Tooltip label="/pricing" value="12,200 views (26%)" subtext="Top entry point" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </section>

      {/* 8. Empty State */}
      <section className="space-y-4">
        <h2 className="text-[18px] font-semibold text-white">8. Empty State (Dotgrid Backdrop)</h2>
        <EmptyState
          title="No Visitor Activity"
          message="No beacon telemetry received during this observation period."
          onAction={() => {}}
        />
      </section>
    </div>
  );
}
