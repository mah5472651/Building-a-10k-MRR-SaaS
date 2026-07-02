import type { AlertRule } from "@/types/handoff";

export function AlertRuleBuilder({
  depositRule,
  agreementRule,
}: {
  depositRule: AlertRule;
  agreementRule: AlertRule;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white/[0.035] p-4">
      <h2 className="serif text-[19px] font-medium">Custom alert rules</h2>
      <p className="mt-1 text-sm text-[var(--ink-soft)]">
        If a stage is pending for more than your threshold, Aeitron AI notifies you and records it in the notification center.
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="label">Deposit pending threshold</span>
          <input
            className="field mt-1"
            name="deposit_threshold_hours"
            type="number"
            min={1}
            defaultValue={depositRule.threshold_hours}
          />
          <span className="mt-2 flex items-center gap-2 text-xs text-[var(--ink-soft)]">
            <input name="deposit_alert_enabled" type="checkbox" defaultChecked={depositRule.enabled} />
            Enable deposit alert
          </span>
        </label>
        <label className="block">
          <span className="label">Agreement unsigned threshold</span>
          <input
            className="field mt-1"
            name="agreement_threshold_hours"
            type="number"
            min={1}
            defaultValue={agreementRule.threshold_hours}
          />
          <span className="mt-2 flex items-center gap-2 text-xs text-[var(--ink-soft)]">
            <input name="agreement_alert_enabled" type="checkbox" defaultChecked={agreementRule.enabled} />
            Enable agreement alert
          </span>
        </label>
      </div>
    </div>
  );
}
