package api

import (
	"context"
	"encoding/json"
	"log"
	"time"

	tea "github.com/charmbracelet/bubbletea/v2"
	"github.com/sst/opencode-sdk-go"
)

type Request struct {
	Path string          `json:"path"`
	Body json.RawMessage `json:"body"`
}

func Start(ctx context.Context, program *tea.Program, client *opencode.Client) {
	backoff := 50 * time.Millisecond
	for {
		select {
		case <-ctx.Done():
			return
		default:
		}

		var req Request
		reqCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
		err := client.Get(reqCtx, "/tui/control/next", nil, &req)
		cancel()
		if err != nil {
			log.Printf("Error getting next request: %v", err)
			time.Sleep(backoff)
			if backoff < time.Second {
				backoff *= 2
			}
			continue
		}
		backoff = 50 * time.Millisecond
		program.Send(req)
	}
}

func Reply(ctx context.Context, client *opencode.Client, response interface{}) tea.Cmd {
	return func() tea.Msg {
		err := client.Post(ctx, "/tui/control/response", response, nil)
		if err != nil {
			return err
		}
		return nil
	}
}
