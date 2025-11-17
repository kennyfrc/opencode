package util

import (
	"math"
	"strings"
	"time"

	"github.com/charmbracelet/lipgloss/v2/compat"
	"github.com/kennyfrc/opencode/internal/styles"
)

var shimmerStart = time.Now()

// Shimmer renders text with a moving foreground highlight.
// bg is the background color, dim is the base text color, bright is the highlight color.
func Shimmer(
	s string,
	bg compat.AdaptiveColor,
	dim compat.AdaptiveColor,
	bright compat.AdaptiveColor,
) string {
	if s == "" {
		return ""
	}

	runes := []rune(s)
	n := len(runes)
	if n == 0 {
		return s
	}

	pad := 8
	period := float64(n + pad*2)
	sweep := 1.6
	elapsed := time.Since(shimmerStart).Seconds()
	pos := (math.Mod(elapsed, sweep) / sweep) * period

	spread := math.Max(1.4, float64(n)/36)

	type seg struct {
		bright bool
		bold   bool
		faint  bool
		text   string
	}
	segs := make([]seg, 0, n/3)

	for i, r := range runes {
		ip := float64(i + pad)
		dist := math.Abs(ip - pos)
		intensity := math.Exp(-0.5 * math.Pow(dist/spread, 2))

		brightSeg := false
		bold := false
		faint := true

		switch {
		case intensity >= 0.8:
			brightSeg = true
			bold = true
			faint = false
		case intensity >= 0.55:
			brightSeg = true
			faint = false
		case intensity >= 0.3:
			brightSeg = false
			faint = false
		}

		if len(segs) == 0 ||
			segs[len(segs)-1].bright != brightSeg ||
			segs[len(segs)-1].bold != bold ||
			segs[len(segs)-1].faint != faint {
			segs = append(segs, seg{
				bright: brightSeg,
				bold:   bold,
				faint:  faint,
				text:   string(r),
			})
		} else {
			segs[len(segs)-1].text += string(r)
		}
	}

	baseStyle := styles.NewStyle().Background(bg).Foreground(dim)
	var b strings.Builder
	b.Grow(len(s) * 2)
	for _, g := range segs {
		st := baseStyle
		if g.bright {
			st = st.Foreground(bright)
		}
		if g.bold {
			st = st.Bold(true)
		}
		if g.faint {
			st = st.Faint(true)
		}
		b.WriteString(st.Render(g.text))
	}
	return b.String()
}
