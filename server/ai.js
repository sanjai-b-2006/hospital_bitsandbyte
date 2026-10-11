// ---------------------------------------------------------------------------
// server/ai.js — shared OpenRouter (MedAssist AI) helpers used by all AI
// endpoints in the OneRecord API (chat, report explainer, medication safety
// check, pre-visit brief, etc.)
// ---------------------------------------------------------------------------
import { query } from './db.js';

// NOTE: read env vars lazily (inside functions) because server.js calls
// dotenv.config() after ESM imports are hoisted — a module-level const here
// would capture undefined OPENROUTER_API_KEY.

export function hasAIConfigured() {
  return !!process.env.OPENROUTER_API_KEY;
}

function openRouterModel() {
  return process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free';
}

// ---------------------------------------------------------------------------
// Pull a patient's (or family member's) live vault data from PostgreSQL and
// format it into a compact context block that gets injected into the LLM.
// ---------------------------------------------------------------------------
export async function getPatientVaultContext(patientId) {
  let vaultContext =
    'PATIENT HEALTH VAULT CONTEXT: No profile selected. Answer generally and ask the user to share details if needed.';

  if (!patientId) return vaultContext;

  try {
    const pRes = await query(
      `SELECT id, name, age, gender, blood_group, allergies, critical_conditions, emergency_contacts, organ_donor
       FROM patients WHERE id = $1`,
      [patientId]
    );
    const depRes = await query(
      `SELECT id, name, relation, age, blood_group, allergies, critical_conditions, guardian_id
       FROM dependents WHERE id = $1`,
      [patientId]
    );
    const dRes = await query(
      `SELECT name, relation, age, blood_group, allergies, critical_conditions
       FROM dependents WHERE guardian_id = $1`,
      [patientId]
    );
    const medsRes = await query(
      `SELECT name, dosage, frequency, purpose, risk_level
       FROM active_medications
       WHERE patient_id = $1 OR dependent_id = $1
       ORDER BY created_at DESC LIMIT 20`,
      [patientId]
    );
    const recRes = await query(
      `SELECT title, type, date, doctor, hospital, diagnosis, risk
       FROM medical_records
       WHERE patient_id = $1 OR dependent_id = $1
       ORDER BY date DESC LIMIT 20`,
      [patientId]
    );

    const fmt = (arr, fn) => (arr && arr.length ? arr.map(fn).join('\n') : '(none recorded)');

    // The viewed profile may be the patient themself OR a dependent (family member)
    const profile = pRes.rows[0] || depRes.rows[0];
    if (profile) {
      const isDependent = !!depRes.rows[0];
      const info = `${profile.name} — Age ${profile.age}, ${profile.gender}, Blood ${profile.blood_group || '?'}${profile.organ_donor ? ', Organ Donor: Yes' : ''}${
        isDependent ? ` (family member: ${profile.relation})` : ''
      }`;
      // For a dependent, include the guardian id so the AI has the full family picture
      const guardianInfo = isDependent ? `\nGuardian: ${profile.guardian_id || 'unknown'}` : '';
      vaultContext = [
        'PATIENT HEALTH VAULT CONTEXT (live from OneRecord PostgreSQL):',
        `Profile: ${info}${guardianInfo}`,
        `Allergies: ${fmt(profile.allergies, (a) => (typeof a === 'object' ? `${a.allergen} (${a.severity})` : String(a)))}`,
        `Active conditions: ${fmt(profile.critical_conditions, (c) => String(c))}`,
        `Active medications: ${fmt(
          medsRes.rows,
          (m) => `- ${m.name} | ${m.dosage || '?'} | ${m.frequency || '?'} | ${m.purpose || ''} | risk: ${m.risk_level}`
        )}`,
        `Recent medical records: ${fmt(
          recRes.rows,
          (r) =>
            `- [${r.date}] ${r.title} (${r.type}) at ${r.hospital || '—'}${r.doctor ? ` by ${r.doctor}` : ''} — ${r.diagnosis || ''} risk:${r.risk}`
        )}`,
        `Family members: ${fmt(dRes.rows, (d) => `- ${d.name} (${d.relation}, ${d.age}, ${d.blood_group || '?'})`)}`,
      ].join('\n');
    } else {
      vaultContext =
        'PATIENT HEALTH VAULT CONTEXT: Patient profile not found for the given id. Be honest about which data is missing.';
    }
  } catch (err) {
    console.warn('[OpenRouter] Could not load patient context:', err.message);
  }

  return vaultContext;
}

// ---------------------------------------------------------------------------
// Low-level OpenRouter chat-completion call. One place to change model,
// headers, or reasoning options.
// ---------------------------------------------------------------------------
export async function askAI({ system, messages, reasoning = { enabled: true } }) {
  const openrouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: openRouterModel(),
      messages: [{ role: 'system', content: system }, ...messages],
      reasoning,
    }),
  });

  const data = await openrouterRes.json();

  if (!openrouterRes.ok) {
    const err = new Error(data?.error?.message || 'OpenRouter request failed.');
    err.status = openrouterRes.status;
    throw err;
  }

  const message = data?.choices?.[0]?.message;
  return {
    model: data?.model || openRouterModel(),
    content: message?.content || '',
    reasoningDetails: message?.reasoning_details || null,
  };
}