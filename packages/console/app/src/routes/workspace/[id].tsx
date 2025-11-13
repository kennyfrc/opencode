import { Show } from "solid-js"
import { createAsync, RouteSectionProps, useParams, A } from "@solidjs/router"
import { querySessionInfo } from "./common"
import { useWorkspaceId } from "~/lib/useWorkspaceId"
import "./[id].css"

export default function WorkspaceLayout(props: RouteSectionProps) {
  const workspaceId = useWorkspaceId()
  const userInfo = createAsync(() => querySessionInfo(workspaceId))

  return (
    <main data-page="workspace">
      <div data-component="workspace-container">
        <nav data-component="workspace-nav">
          <nav data-component="nav-desktop">
            <div data-component="workspace-nav-items">
              <A href={`/workspace/${workspaceId}`} end activeClass="active" data-nav-button>
                Zen
              </A>
              <A href={`/workspace/${workspaceId}/keys`} activeClass="active" data-nav-button>
                API Keys
              </A>
              <A href={`/workspace/${workspaceId}/members`} activeClass="active" data-nav-button>
                Members
              </A>
              <Show when={userInfo()?.isAdmin}>
                <A href={`/workspace/${workspaceId}/billing`} activeClass="active" data-nav-button>
                  Billing
                </A>
                <A href={`/workspace/${workspaceId}/settings`} activeClass="active" data-nav-button>
                  Settings
                </A>
              </Show>
            </div>
          </nav>

          <nav data-component="nav-mobile">
            <div data-component="workspace-nav-items">
              <A href={`/workspace/${workspaceId}`} end activeClass="active" data-nav-button>
                Zen
              </A>
              <A href={`/workspace/${workspaceId}/keys`} activeClass="active" data-nav-button>
                API Keys
              </A>
              <A href={`/workspace/${workspaceId}/members`} activeClass="active" data-nav-button>
                Members
              </A>
              <Show when={userInfo()?.isAdmin}>
                <A href={`/workspace/${workspaceId}/billing`} activeClass="active" data-nav-button>
                  Billing
                </A>
                <A href={`/workspace/${workspaceId}/settings`} activeClass="active" data-nav-button>
                  Settings
                </A>
              </Show>
            </div>
          </nav>
        </nav>
        <div data-component="workspace-content">{props.children}</div>
      </div>
    </main>
  )
}
