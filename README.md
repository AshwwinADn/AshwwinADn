<img src="./assets/signal.svg" width="100%" alt="Ashwwin">

## Current focus

Detection engineering, Windows event logs, and the evidence behind an alert.

## Selected work

<!-- Add your public repositories here as you publish them. Lead with what each project does. -->
- [Windows sign-in investigation](./lab/windows-sign-in.md) — follow a synthetic event sequence from raw telemetry to a detection and triage decision.

## Detection lab

**Sample alert · Failed network sign-ins followed by a success**

```text
Host      LAB-WS01
Account   lab-analyst
Source    192.0.2.24
Signal    3 failed sign-ins, then 1 success
Verdict   Review the successful sign-in
```

[Read the investigation](./lab/windows-sign-in.md) · [View the Sigma base rules](./lab/rules/) · [Inspect the sample events](./lab/events.json)

<details>
<summary>Lab architecture and investigation index</summary>

```text
Windows Security events → Sigma base rules → Correlation → Analyst review
```

- [Investigation timeline and validation cases](./lab/windows-sign-in.md#timeline)

<!-- Add real entries as they become public: tools and recordings, CTF notes, merged PRs, talks, disclosures, and milestones. -->
</details>

## Latest

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/AshwwinADn/AshwwinADn/output/latest-dark.svg">
  <img width="560" src="https://raw.githubusercontent.com/AshwwinADn/AshwwinADn/output/latest.svg" alt="Latest public repository activity with dates">
</picture>

[Browse repositories](https://github.com/AshwwinADn?tab=repositories)

## Activity

<picture>
  <source media="(prefers-reduced-motion: reduce)" srcset="./assets/activity-still.svg">
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/AshwwinADn/AshwwinADn/output/snake-dark.svg">
  <img width="680" src="https://raw.githubusercontent.com/AshwwinADn/AshwwinADn/output/snake.svg" alt="A cyan snake eats the green squares on my GitHub contribution calendar">
</picture>

## Connect

[GitHub](https://github.com/AshwwinADn) · [Current interests](./NOW.md)

<!-- Add a public contact link or PGP fingerprint if you want to share one. -->
