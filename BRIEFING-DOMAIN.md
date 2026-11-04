# Briefing: zweite Subdomain für die Huge-London-Vergleichsseite

**Für:** den Agenten, der das DNS macht
**Von:** Claude, 04.11.2026
**Scope:** genau ein DNS-Record. Sonst nichts.

---

## Der Record

| Feld | Wert |
|---|---|
| Typ | `CNAME` |
| Name | `huge-london` |
| Ziel | `sgx1992.github.io` |
| Proxy | **DNS only** (graue Wolke) |
| TTL | Auto |

Also: `huge-london.ddxconference.com` → `sgx1992.github.io`.

Die Zone liegt bei **Cloudflare** (Account `158c3f36b720435ede948dd751b729d2`,
Nameserver `conrad`/`fish.ns.cloudflare.com`; GoDaddy ist nur Registrar, dort
nichts ändern).

Das GitHub-Repo `SGX1992/ddx-huge-london` und seine Pages-Konfiguration
existieren bereits und warten auf den Eintrag — es fehlt wirklich nur das DNS.
Die Subdomain gab es schon einmal; der Record ist bei der Migration nach
Cloudflare verlorengegangen.

---

## Die drei Fallen (dieselben wie beim letzten Mal)

1. **Proxy muss aus sein.** Orange Wolke verhindert, dass GitHub Pages ein
   Zertifikat ausstellen kann. Die Checkbox in dieser Zone hat sich schon
   einmal von selbst wieder aktiviert — nach dem Speichern nachsehen.
2. **Kein A-Record.** CNAME auf `sgx1992.github.io`, sonst nichts.
3. **Nameserver nicht anfassen.** An der Zone hängen rund 15 Subdomains.

Zum Vergleich, so sieht ein korrekter Eintrag aus:

```bash
dig @conrad.ns.cloudflare.com +short huge.ddxconference.com CNAME
```

→ `sgx1992.github.io.`

---

## Fertig heißt

```bash
dig @1.1.1.1 +short huge-london.ddxconference.com CNAME
```

→ `sgx1992.github.io.`

```bash
dig @1.1.1.1 +short huge-london.ddxconference.com A
```

→ vier Adressen aus `185.199.108-111.153`. Sind es `104.x` oder `172.67.x`,
läuft noch der Proxy.

---

## Nicht anfassen

Keine anderen Records in der Zone, insbesondere nicht den Apex (`75.2.60.5`,
Netlify), nicht `www` (→ `ddx-relaunch.netlify.app`) und nicht `huge`
(→ die bereits laufende Hauptfassung). Keine Dateien im Projekt ändern.

---

## Kontext in einem Absatz

Von der Huge-Dinner-Seite gibt es ab jetzt zwei Fassungen, damit Sebastian sie
nebeneinander zeigen kann: `huge.ddxconference.com` ist die stark reduzierte
Version nach Huges Briefing, `huge-london.ddxconference.com` dieselbe Marke mit
den Fotos und dem Veranstaltungsort zurück. Beide liegen im selben Projekt
(`ddx-huge/`) und teilen sich die Assets, werden aber über zwei getrennte
Skripte in zwei Repos veröffentlicht.
