# UI/UX Design Documentation

## Design System

### Color Palette (Cyber/Neon Theme)

| Name | Hex | Usage | RGB |
|------|-----|-------|-----|
| **Black** | `#0a0e27` | Background | 10, 14, 39 |
| **Dark** | `#1a1f3a` | Cards, panels | 26, 31, 58 |
| **Blue** | `#00d4ff` | Primary, borders | 0, 212, 255 |
| **Green** | `#00ff41` | Success, highlights | 0, 255, 65 |
| **Purple** | `#b300ff` | Secondary | 179, 0, 255 |
| **Pink** | `#ff006e` | Danger, alerts | 255, 0, 110 |

### Typography

- **Font**: Courier New / Monospace (Technical feel)
- **Headings**: Bold, 24-48px
- **Body**: Regular, 14-16px
- **Letter Spacing**: 1-2px (for uppercase)

### Effects

- **Glow**: Box-shadow with color matching element
- **Border**: 2px solid color-matching borders
- **Animation**: Pulse effect on timers and important elements

---

## Screen Mockups

### 1. Login Screen

```
┌─────────────────────────────────────────┐
│                                         │
│      🔷 CYBER ETYMOLOGY 🔷             │
│    Competitive Word-Building Game      │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ TEAM LOGIN                       │  │
│  │                                  │  │
│  │ College ID: [________________]   │  │
│  │                                  │  │
│  │ Password:   [________________]   │  │
│  │                                  │  │
│  │ [         LOGIN          ]       │  │
│  │                                  │  │
│  │ New team? SIGN UP                │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘

Colors:
- Background: #0a0e27
- Card: #1a1f3a with #00d4ff border
- Text: #00d4ff (labels), #00ff41 (input)
- Button: #00d4ff → hover #00ff41
```

### 2. Signup Screen

```
┌────────────────────────────────────────────────────┐
│                                                    │
│      🔷 CYBER ETYMOLOGY 🔷                        │
│        Register Your Team                         │
│                                                    │
│  ┌───────────────────────────────────────────┐   │
│  │ TEAM REGISTRATION                         │   │
│  │                                            │   │
│  │ Team Name:    [______________________]    │   │
│  │ College ID:   [______________________]    │   │
│  │                                            │   │
│  │ Member 1:     [______________________]    │   │
│  │ Member 2:     [______________________]    │   │
│  │ Member 3:     [______________________]    │   │
│  │                                            │   │
│  │ Password:     [______________________]    │   │
│  │ Confirm:      [______________________]    │   │
│  │                                            │   │
│  │ [     REGISTER TEAM      ]                │   │
│  │                                            │   │
│  │ Already registered? LOGIN                 │   │
│  └───────────────────────────────────────────┘   │
│                                                    │
└────────────────────────────────────────────────────┘
```

### 3. Game Screen (Participant)

```
╔════════════════════════════════════════════════════════════════╗
║ CYBER ETYMOLOGY              Question 2/5         [30s] 🟢      ║
╠════════════════════════════════════════════════════════════════╣
║                                                                  ║
║                                                                  ║
║     Word must START WITH                                        ║
║                                                                  ║
║               🔹   A   🔹                                        ║
║           (animated glow)                                       ║
║                                                                  ║
║     Enter a tech-related word starting with "A"               ║
║                                                                  ║
║  ┌──────────────────────────────────────────────────────────┐  ║
║  │                  algorithm                                │  ║
║  └──────────────────────────────────────────────────────────┘  ║
║                                                                  ║
║  ┌─────────────────────┐  ┌─────────────────────┐               ║
║  │      SUBMIT         │  │        SKIP         │               ║
║  └─────────────────────┘  └─────────────────────┘               ║
║                                                                  ║
║                   LIVE LEADERBOARD                              ║
║                                                                  ║
║  #  Team Name              Score                               ║
║  1  Team Alpha              450                                ║
║  2  Team Beta               380                                ║
║  3  Team Gamma              320                                ║
║                                                                  ║
╚════════════════════════════════════════════════════════════════╝

Fullscreen: YES
Colors:
- Question box: #1a1f3a with #00d4ff border
- Character: #b300ff (animated glow-pulse)
- Input: #00d4ff text on #0a0e27
- Button SUBMIT: #00ff41 background
- Button SKIP: #ff006e border
```

### 4. Game Screen - Result

```
╔════════════════════════════════════════════════════════════════╗
║ CYBER ETYMOLOGY              Question 2/5         [10s] 🔴     ║
╠════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  ┌──────────────────────────────────────────────────────────┐  ║
║  │                  ANSWER SUBMITTED                         │  ║
║  │                                                            │  ║
║  │                      Score: +15                           │  ║
║  │                                                            │  ║
║  │                Word: algorithm                            │  ║
║  │                                                            │  ║
║  │        Waiting for next question...                       │  ║
║  │        (animated pulse)                                   │  ║
║  └──────────────────────────────────────────────────────────┘  ║
║                                                                  ║
║            SCORE BREAKDOWN                                      ║
║  a(1) + l(2) + g(5) + o(1) + r(8) + i(1) + t(1) + h(3) +       ║
║  m(4) = 15                                                       ║
║                                                                  ║
╚════════════════════════════════════════════════════════════════╝
```

### 5. Admin Dashboard - Control Tab

```
┌─────────────────────────────────────────────────────────────────┐
│ ADMIN PANEL                                                     │
│ Cyber Etymology Game Control                                    │
│                                                                 │
│ [CONTROL] [MONITORING] [LEADERBOARD] [ANALYTICS]              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  GAME CONTROL                                                   │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ [START GAME]  [PAUSE]  [STOP]                             │ │
│ │                                                            │ │
│ │ Game Status: IN-PROGRESS                                 │ │
│ │                                                            │ │
│ │ [           NEXT QUESTION            ]                   │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  TEAM MANAGEMENT                                                │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Team Alpha          (3 members) [DISQUALIFY]             │ │
│ │ Team Beta           (3 members) [DISQUALIFY]             │ │
│ │ Team Gamma          (3 members) [DISQUALIFY]             │ │
│ │ Team Delta          (3 members) [DISQUALIFY]             │ │
│ │ ...                                                        │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Colors:
- Tabs: Active #00d4ff (glow), Inactive #b300ff
- Buttons: #00ff41 (primary), #b300ff (secondary), #ff006e (danger)
```

### 6. Admin Dashboard - Leaderboard Tab

```
┌─────────────────────────────────────────────────────────────────┐
│ ADMIN PANEL                                                     │
│ [CONTROL] [MONITORING] [LEADERBOARD] [ANALYTICS]              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LIVE LEADERBOARD                                               │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │                                                            │ │
│ │ #  Team Name            Score      Time Taken            │ │
│ │ ─────────────────────────────────────────────────────────  │ │
│ │ 1  Team Alpha           250        12:00                 │ │
│ │ 2  Team Beta            220        14:30                 │ │
│ │ 3  Team Gamma           190        15:45                 │ │
│ │ 4  Team Delta           160        18:20                 │ │
│ │ 5  Team Epsilon         150        19:15                 │ │
│ │                                                            │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ANALYTICS                                                      │
│ ┌──────────────┬──────────────┬──────────────┐                │
│ │ Total Teams  │ Questions    │ Status       │                │
│ │      25      │      5       │ IN-PROGRESS  │                │
│ └──────────────┴──────────────┴──────────────┘                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

### Participant App
```
App
├── LoginPage
├── SignupPage
├── GameScreen
│   ├── Header (timer, question number)
│   ├── QuestionCard
│   │   ├── CharacterDisplay
│   │   └── QuestionTypeInfo
│   ├── InputSection
│   │   ├── WordInput
│   │   ├── SubmitButton
│   │   └── SkipButton
│   ├── ResultCard (conditionally shown)
│   └── LiveLeaderboard
└── FullscreenManager
```

### Admin App
```
AdminApp
├── AdminDashboard
│   ├── Header
│   ├── TabNavigation
│   │   ├── ControlTab
│   │   │   ├── GameControl
│   │   │   └── TeamManagement
│   │   ├── MonitoringTab
│   │   │   └── LiveMonitoring
│   │   ├── LeaderboardTab
│   │   │   └── LeaderboardDisplay
│   │   └── AnalyticsTab
│   │       └── AnalyticsDashboard
│   └── StatusBar
```

---

## Responsive Breakpoints

| Breakpoint | Width | Use Case |
|-----------|-------|----------|
| Mobile | < 640px | (Fullscreen only, game enforces landscape) |
| Tablet | 640-1024px | Admin dashboard (responsive layout) |
| Desktop | > 1024px | Admin dashboard (full features) |

**Note:** Game screen is fullscreen-only and mobile-responsive for landscape orientation.

---

## Animations

### Glow Pulse
```css
@keyframes glow-pulse {
  0% { box-shadow: 0 0 5px rgba(0, 212, 255, 0.3); }
  50% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.8); }
  100% { box-shadow: 0 0 5px rgba(0, 212, 255, 0.3); }
}
```

### Timer Color Change (CSS)
- Green (>20s): `#00ff41`
- Purple (10-20s): `#b300ff`
- Pink (<10s): `#ff006e`
- Animated pulse when < 5s

### Slide In
```css
@keyframes slide-in {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

---

## Accessibility

- High contrast colors (#00d4ff on #0a0e27: 13:1 ratio)
- Large clickable areas (min 48x48px)
- Keyboard navigation support
- Focus indicators visible
- Screen reader friendly
- No flashing animations (> 3Hz avoided)

---

## Dark Mode

- Default theme is dark
- All colors optimized for reduced eye strain
- No light mode variant needed

---

## Component Examples

### Button States

```
Normal:    [    SUBMIT    ]
           ▲─────────────────▲
           Border: #00d4ff
           Bg: transparent
           Text: #00d4ff

Hover:     [    SUBMIT    ]
           ▲─────────────────▲
           Border: #00d4ff
           Bg: #00d4ff
           Text: #0a0e27
           Glow: box-shadow

Active:    [    SUBMIT    ]
           Transform: scale(0.98)

Disabled:  [    SUBMIT    ]
           Opacity: 0.5
           Cursor: not-allowed
```

### Input Focus

```
Unfocused: [________________]
           Border: #00d4ff

Focused:   [________________]
           Border: #00ff41
           Glow: #00ff41
           Text color: #00ff41
```

---

## Theme Variables

```css
--cyber-black: #0a0e27;
--cyber-dark: #1a1f3a;
--cyber-blue: #00d4ff;
--cyber-green: #00ff41;
--cyber-purple: #b300ff;
--cyber-pink: #ff006e;

--glow-distance: 10px;
--glow-blur: 0 0 10px;
--border-width: 2px;
--border-radius: 4px;
```
