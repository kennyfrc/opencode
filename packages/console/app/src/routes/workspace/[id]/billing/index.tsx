import { MonthlyLimitSection } from "./monthly-limit-section"
import { BillingSection } from "./billing-section"
import { ReloadSection } from "./reload-section"
import { PaymentSection } from "./payment-section"
import { Show } from "solid-js"
import { createAsync, useParams } from "@solidjs/router"
import { queryBillingInfo, querySessionInfo } from "../../common"
import { useWorkspaceId } from "~/lib/useWorkspaceId"

export default function () {
  const workspaceId = useWorkspaceId()
  const userInfo = createAsync(() => querySessionInfo(workspaceId))
  const billingInfo = createAsync(() => queryBillingInfo(workspaceId))

  return (
    <div data-page="workspace-[id]">
      <div data-slot="sections">
        <Show when={userInfo()?.isAdmin}>
          <BillingSection />
          <Show when={billingInfo()?.customerID}>
            <ReloadSection />
            <MonthlyLimitSection />
            <PaymentSection />
          </Show>
        </Show>
      </div>
    </div>
  )
}
