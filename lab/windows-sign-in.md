# Windows sign-in investigation

This example uses synthetic records and a documentation-only IP address. It illustrates how to triage repeated failed network sign-ins followed by a success.

## Timeline

| Time (UTC) | Event | Result |
|---|---|---|
| 10:00:00 | 4625 | Failed network sign-in |
| 10:00:45 | 4625 | Failed network sign-in |
| 10:01:17 | 4625 | Failed network sign-in |
| 10:02:04 | 4624 | Successful network sign-in |

All four [sample records](./events.json) share the host, account, and source address.

## Detection

Use the base rules for [failed](./rules/network-logon-failed.yml) and [successful](./rules/network-logon-success.yml) Windows network logons. In your SIEM, group matches by destination host, normalized account domain and name, and source IP. Exclude missing identifiers. At each success, look back five minutes for at least three earlier failures in the same group. The base rules identify individual events. The grouping, count, and order are implemented in the SIEM.

| Validation case | Expected result |
|---|---|
| Three failures and a later success in the same group within five minutes | Alert |
| Success from a different source or for another account | No alert |
| Success before the third failure | No alert |
| Third-most-recent failure more than five minutes before success | No alert |

## Triage decision

Review the successful session. Verify whether the user expected it, check whether the source is a known system, and correlate any available endpoint or authentication evidence from immediately after the login. A credential retry can produce this sequence. Escalate if independent evidence supports unauthorized access.
