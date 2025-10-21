import React, { useMemo, useRef } from "react";
import { Clock, Inbox, Check, Trash2, BellRing, ListChecks } from "lucide-react";
import { Badge, Button, Card, Tabs, TabsList, TabsPanel, TabsTrigger } from "@/ui";
import useInbox, { type InboxHookValue } from "@/hooks/useInbox";
import { getNextFocusIndex, isActivationKey, isRovingKey } from "@/utils/a11yNavigation";

const SkipLink: React.FC<{ targetId: string; label: string }> = ({ targetId, label }) => (
  <a
    href={`#${targetId}`}
    className="sr-only focus:not-sr-only focus:absolute focus:right-6 focus:top-4 focus:z-50 focus:rounded-full focus:border focus:border-[color:var(--glass-border)] focus:bg-[color:var(--glass-bg)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[color:var(--glass-fg)]"
  >
    {label}
  </a>
);

const NotificationItem: React.FC<{
  index: number;
  count: number;
  item: InboxHookValue["notifications"][number];
  markAsRead: (id: string) => void;
  focusRefs: React.MutableRefObject<Array<HTMLDivElement | null>>;
}> = ({ index, count, item, markAsRead, focusRefs }) => {
  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (isRovingKey(event.key)) {
      event.preventDefault();
      const nextIndex = getNextFocusIndex(index, event.key, count);
      const target = focusRefs.current[nextIndex];
      target?.focus();
    }

    if (isActivationKey(event.key)) {
      event.preventDefault();
      if (!item.read) {
        markAsRead(item.id);
      }
    }
  };

  return (
    <div
      ref={(node) => {
        focusRefs.current[index] = node;
      }}
      role="listitem"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      data-notification-id={item.id}
      className="flex flex-col gap-2 rounded-[var(--radius-m)] border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]/70 p-4 outline-none focus-visible:border-[color:var(--accent)] focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-right">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--glass-bg-strong, var(--surface-2))] text-[color:var(--accent)]">
            <BellRing className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[color:var(--glass-fg)]">{item.title}</p>
            <p className="text-xs text-[color:var(--muted-foreground)]">{item.timestamp}</p>
          </div>
        </div>
        <Badge variant={item.read ? "muted" : "primary"}>{item.read ? "مقروء" : "غير مقروء"}</Badge>
      </div>
      <p className="text-sm text-[color:var(--muted-foreground)]">{item.message}</p>
      <div className="flex justify-end">
        <Button
          variant={item.read ? "ghost" : "glass"}
          size="sm"
          leftIcon={<Check className="h-3.5 w-3.5" />}
          aria-label={`تحديد الإشعار ${item.title} كمقروء`}
          onClick={() => markAsRead(item.id)}
          disabled={item.read}
        >
          تمت القراءة
        </Button>
      </div>
    </div>
  );
};

const ActivityItem: React.FC<{
  index: number;
  count: number;
  item: InboxHookValue["activity"][number];
  focusRefs: React.MutableRefObject<Array<HTMLDivElement | null>>;
}> = ({ index, count, item, focusRefs }) => {
  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (!isRovingKey(event.key)) return;
    event.preventDefault();
    const nextIndex = getNextFocusIndex(index, event.key, count);
    const target = focusRefs.current[nextIndex];
    target?.focus();
  };

  return (
    <div
      ref={(node) => {
        focusRefs.current[index] = node;
      }}
      role="listitem"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      data-activity-id={item.id}
      className="flex flex-col gap-2 rounded-[var(--radius-m)] border border-[color:var(--glass-border)] bg-[color:var(--surface)]/60 p-4 outline-none focus-visible:border-[color:var(--accent)] focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-right">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--glass-bg)] text-[color:var(--accent)]">
            <Clock className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[color:var(--glass-fg)]">{item.title}</p>
            <p className="text-xs text-[color:var(--muted-foreground)]">{item.timestamp}</p>
          </div>
        </div>
      </div>
      <p className="text-sm text-[color:var(--muted-foreground)]">{item.description}</p>
    </div>
  );
};

const NotificationsPanel: React.FC<{ hook: InboxHookValue }> = ({ hook }) => {
  const focusRefs = useRef<Array<HTMLDivElement | null>>([]);
  const notifications = hook.notifications;

  return (
    <div className="space-y-4" data-section="notifications-list" role="list">
      {notifications.length === 0 ? (
        <Card variant="glass" padding="lg" className="text-center text-sm text-[color:var(--muted-foreground)]">
          لا توجد إشعارات جديدة حاليًا.
        </Card>
      ) : (
        notifications.map((item, index) => (
          <NotificationItem
            key={item.id}
            index={index}
            count={notifications.length}
            item={item}
            markAsRead={hook.markAsRead}
            focusRefs={focusRefs}
          />
        ))
      )}
    </div>
  );
};

const ActivityPanel: React.FC<{ hook: InboxHookValue }> = ({ hook }) => {
  const focusRefs = useRef<Array<HTMLDivElement | null>>([]);
  return (
    <div className="space-y-4" data-section="activity-list" role="list">
      {hook.activity.map((item, index) => (
        <ActivityItem
          key={item.id}
          index={index}
          count={hook.activity.length}
          item={item}
          focusRefs={focusRefs}
        />
      ))}
      <div className="flex justify-center">
        <Button
          variant="glass"
          size="sm"
          leftIcon={<ListChecks className="h-4 w-4" />}
          onClick={() => hook.loadMore()}
          aria-label="تحميل نشاط إضافي"
        >
          تحميل المزيد
        </Button>
      </div>
    </div>
  );
};

const NotificationsPageBody: React.FC<{ hook: InboxHookValue }> = ({ hook }) => {
  const unreadBadge = useMemo(() => hook.unreadCount, [hook.unreadCount]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6" data-page="notifications">
      <SkipLink targetId="notifications-main" label="تخطي إلى الإشعارات" />
      <Card
        variant="glass"
        padding="lg"
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        data-section="notifications-header"
      >
        <div className="flex items-center gap-3 text-right">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--glass-bg-strong, var(--surface-2))] text-[color:var(--accent)] shadow-[var(--shadow-glass-soft)]">
            <Inbox className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[color:var(--glass-fg)]">مركز الإشعارات والنشاط</h1>
            <p className="text-sm text-[color:var(--muted-foreground)]">
              راجع تنبيهات الأداء وحركة المتجر الخاصة بك في مكان واحد.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={unreadBadge > 0 ? "primary" : "muted"} data-testid="notifications-unread">
            {unreadBadge} غير مقروءة
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 className="h-4 w-4" />}
            onClick={() => hook.clear()}
            aria-label="مسح الإشعارات"
            disabled={hook.notifications.length === 0}
          >
            مسح الكل
          </Button>
        </div>
      </Card>

      <Tabs defaultValue="notifications" className="space-y-6" data-section="notifications-tabs">
        <TabsList aria-label="مركز التنبيهات" className="grid gap-2 md:grid-cols-2">
          <TabsTrigger value="notifications" data-tab="notifications">
            إشعارات
          </TabsTrigger>
          <TabsTrigger value="activity" data-tab="activity">
            نشاط
          </TabsTrigger>
        </TabsList>
        <TabsPanel id="notifications-main" value="notifications">
          <NotificationsPanel hook={hook} />
        </TabsPanel>
        <TabsPanel value="activity">
          <ActivityPanel hook={hook} />
        </TabsPanel>
      </Tabs>
    </div>
  );
};

const NotificationsPage: React.FC = () => {
  const hookValue = useInbox();
  return <NotificationsPageBody hook={hookValue} />;
};

export { NotificationsPageBody };
export default NotificationsPage;
