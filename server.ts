import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

const app = express();
app.use(express.json());

// Initialize Gemini client server-side
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System safety & tone instruction
const BASE_SYSTEM_INSTRUCTION = `You are TechCare AI, an expert, patient, and beginner-friendly IT Support specialist.
Your mission is: "Technology Problems. Simple Solutions."
RULES:
1. Explain technical concepts in simple, jargon-free everyday language that any beginner or non-technical person can understand.
2. Provide safe, step-by-step instructions. Each step must have a clear action ("What to do") and a brief reason ("Why this helps").
3. CRITICAL SAFETY RULE: NEVER recommend opening power supplies, repairing electrical circuits, soldering, disassembling sealed hardware, handling swollen batteries, or performing dangerous hardware modifications.
4. When an issue requires hands-on physical repair, warranty service, or dangerous procedures, explicitly provide a prominent SAFETY WARNING and advise contacting an authorized professional technician.
5. Return clean structured JSON where requested so the client can render beautiful interactive cards and steps.`;

// Helper for fallback responses if API key is not configured or in case of error
function getFallbackTroubleshoot(problem: string, category: string = 'General') {
  const p = problem.toLowerCase();
  let issue = "General System Diagnostic";
  let causes = [
    "Background processes consuming excessive CPU or RAM",
    "Temporary cache and pending operating system updates",
    "Driver incompatibility or temporary device glitch"
  ];
  let steps = [
    { title: "Perform a Clean Restart", detail: "Shut down your device completely, wait 30 seconds, and turn it back on. This clears cached memory and resets stalled services." },
    { title: "Check for System Updates", detail: "Go to Settings > Update & Security (Windows) or System Settings > Software Update (Mac) and install any pending official updates." },
    { title: "Free up Storage Space", detail: "Ensure your primary drive has at least 15% free disk space for temporary files and virtual memory paging." },
    { title: "Close Unused Applications", detail: "Open Task Manager (Ctrl+Shift+Esc on Windows) or Activity Monitor (Cmd+Space on Mac) and close programs with high resource usage." }
  ];
  let safetyNotice = "Always save your open work before restarting or installing updates. Do not open your computer casing unless experienced with static electricity safety.";

  if (p.includes('wifi') || p.includes('internet') || p.includes('network') || p.includes('disconnect')) {
    issue = "Internet Connectivity Issue";
    causes = [
      "Router / modem cache saturation or DNS server lag",
      "Wi-Fi adapter in power-save sleep mode or outdated driver",
      "Physical distance, walls, or channel frequency interference"
    ];
    steps = [
      { title: "The 30-Second Router Power Cycle", detail: "Unplug your modem and router power cable. Wait 30 full seconds, then plug back in and wait 2 minutes for all indicator lights to stabilize." },
      { title: "Toggle Wi-Fi Off and On", detail: "Turn off your computer's Wi-Fi toggle for 10 seconds, then reconnect to your network." },
      { title: "Test with Another Device", detail: "Check if your smartphone connects to the same Wi-Fi. If your phone works, the issue is local to your computer; if not, your internet service provider (ISP) may have an outage." },
      { title: "Forget and Reconnect Network", detail: "Go to Wi-Fi settings, select 'Forget this network', and enter your Wi-Fi password again fresh to clear stale IP leases." }
    ];
    safetyNotice = "Never reset router pinhole hardware buttons unless you have your ISP credentials ready, as this wipes network configuration.";
  } else if (p.includes('slow') || p.includes('freeze') || p.includes('hanging')) {
    issue = "Computer Performance Degradation";
    causes = [
      "Too many startup applications launching automatically",
      "High memory consumption from browser tabs or background utilities",
      "Fragmented or nearly full storage drive"
    ];
    steps = [
      { title: "Restart to Flush Virtual Memory", detail: "A simple restart terminates memory leaks from background apps that have been running for days." },
      { title: "Disable Unnecessary Startup Items", detail: "Press Ctrl+Shift+Esc to open Task Manager, switch to the 'Startup apps' tab, and disable apps you rarely need on boot." },
      { title: "Check Storage Health", detail: "Make sure your C: or main drive has at least 20GB of free space. Delete large temporary downloads." },
      { title: "Run Built-in Virus Scan", detail: "Open Windows Security or Mac Malware scan to verify your computer is free from adware miners." }
    ];
  } else if (p.includes('battery') || p.includes('charge') || p.includes('power')) {
    issue = "Battery & Power Diagnostic";
    causes = [
      "Battery health degradation over charging cycles",
      "Power adapter or cable wear, or dusty charging port",
      "Intensive background apps preventing sleep states"
    ];
    steps = [
      { title: "Inspect Power Adapter & Wall Outlet", detail: "Try plugging directly into a different wall outlet without extension cords. Ensure cable has no visible fraying." },
      { title: "Check Charging Port for Lint", detail: "Use a flashlight to gently inspect the charging port for dust or lint. Do not use metal needles or liquids." },
      { title: "Check Battery Health Report", detail: "On Windows, generate a battery report via Windows PowerShell (`powercfg /batteryreport`). On Mac, check System Settings > Battery Health." }
    ];
    safetyNotice = "DANGER WARNING: If your laptop chassis is bulging, trackpad is pushed up, or the battery feels abnormally hot, STOP USING IMMEDIATELY and disconnect the charger. Swollen lithium-ion batteries are a fire hazard and require certified professional replacement.";
  }

  return {
    issueTitle: issue,
    category: category || "Computer/OS",
    summary: "Beginner-friendly troubleshooting guide tailored for your symptom.",
    possibleCauses: causes,
    troubleshootingSteps: steps,
    safetyNotice,
    recommendedPriority: p.includes('battery') || p.includes('not starting') ? "High" : "Medium",
    preventiveTips: [
      "Keep regular cloud or external drive backups of your critical documents.",
      "Restart your computer at least once a week to maintain system health."
    ]
  };
}

// Endpoint 1: Comprehensive Troubleshooting Assistant (Computer / General)
app.post('/api/troubleshoot', async (req: Request, res: Response) => {
  try {
    const { problem, category = 'Computer/OS', deviceType = 'Desktop/Laptop', os = 'Windows/macOS' } = req.body;

    if (!problem || typeof problem !== 'string' || problem.trim().length === 0) {
      return res.status(400).json({ error: 'Please describe the problem you are experiencing.' });
    }

    if (!ai) {
      // Graceful fallback with expert curated logic
      const fallback = getFallbackTroubleshoot(problem, category);
      return res.json(fallback);
    }

    const prompt = `A non-technical user is asking for IT support.
Problem Description: "${problem}"
Category: "${category}"
Device Type: "${deviceType}"
Operating System: "${os}"

Provide a beginner-friendly diagnosis and safe solution.
Format your output as a strictly valid JSON object matching this schema:
{
  "issueTitle": "A concise, user-friendly title of the identified issue",
  "category": "${category}",
  "summary": "1-2 sentences in simple, friendly words explaining what is going on",
  "possibleCauses": ["Cause 1 in plain terms", "Cause 2 in plain terms", "Cause 3 in plain terms"],
  "troubleshootingSteps": [
    {
      "title": "Clear step title (e.g., Restart your computer)",
      "detail": "Step-by-step instructions in simple language on how to do it and what to observe."
    }
  ],
  "safetyNotice": "Explicit safety alert if applicable (e.g. do not open power supply, check for swollen battery, back up data). If completely safe, advise standard precautions.",
  "recommendedPriority": "Low" | "Medium" | "High" | "Critical",
  "preventiveTips": ["Tip 1 to prevent this in the future", "Tip 2"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: BASE_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    try {
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch {
      // If parsing fails, fall back cleanly
      return res.json(getFallbackTroubleshoot(problem, category));
    }
  } catch (error: any) {
    console.error('Error in /api/troubleshoot:', error);
    const fallback = getFallbackTroubleshoot(req.body?.problem || 'general issue');
    return res.json(fallback);
  }
});

// Fallback generator for Software Analyzer
function getFallbackSoftwareAnalysis(softwareName: string, issueDescription: string, errorCode: string = '') {
  return {
    softwareName,
    identifiedIssue: `Issue encountered with ${softwareName}`,
    explanation: "The application might be experiencing temporary file corruption, an unreleased background process lock, or missing local permissions.",
    causes: [
      "Outdated application build or pending hotfix patch",
      "Corrupted cache files or user preferences profile",
      "Background conflict or firewall service block",
      "Insufficient user permissions to write temporary files"
    ],
    steps: [
      { title: "Force Quit & Restart Application", detail: "Open Task Manager (Ctrl+Shift+Esc on Windows) or Activity Monitor on Mac, select all instances of " + softwareName + ", click 'End Task', then launch the program fresh." },
      { title: "Run as Administrator", detail: "Right-click the application desktop icon and select 'Run as Administrator' to verify if Windows permission restrictions were causing the crash." },
      { title: "Check for Official Updates", detail: "Open the Help or Settings menu within " + softwareName + " or visit the developer's official website to install any available bug fixes." },
      { title: "Clear Application Cache or Temp Files", detail: "Press Win+R, type %temp% and press Enter. Clear outdated temporary files that may be conflicting with application state." },
      { title: "Perform App Repair or Reinstall", detail: "Go to Settings > Installed Apps, find " + softwareName + ", click 'Modify' or 'Repair'. If not available, uninstall and download a fresh copy." }
    ],
    whatNotToDo: [
      "Do NOT download third-party DLL replacement files from random search engine results; these often contain malware.",
      "Do NOT disable your primary antivirus protection permanently."
    ],
    whenToContactVendor: "If the issue persists after reinstalling and your computer has restarted, contact official customer support for " + softwareName + " and provide error code: " + (errorCode || "N/A")
  };
}

// Fallback generator for Internet Troubleshooter
function getFallbackNetworkDiagnosis(symptom: string, connectionType: string = 'wifi') {
  return {
    symptom,
    connectionType,
    diagnosticSummary: "Network connectivity interruption between your local device, Wi-Fi gateway, or external Domain Name System (DNS).",
    quickChecks: [
      { check: "Check Physical Wi-Fi / Airplane Toggle", tip: "Verify airplane mode is off and the Wi-Fi icon is illuminated." },
      { check: "Test Another Device on Same Wi-Fi", tip: "Check if your smartphone connects to the same network. This isolates whether your computer or the router is the issue." },
      { check: "Inspect Router LED Status Lights", tip: "The 'Internet' or 'WAN' light on your router should be solid green or white, not blinking amber or red." }
    ],
    steps: [
      { title: "The 30-Second Router & Modem Power Cycle", detail: "Unplug the power cord from the back of your router/modem. Wait 30 full seconds to allow all internal capacitors to discharge. Plug it back in and wait 2 minutes for network lights to turn solid." },
      { title: "Forget and Reconnect Network", detail: "In Wi-Fi settings, click 'Forget this network', then search for your Wi-Fi name again and re-enter your password fresh to refresh your local IP lease." },
      { title: "Run Built-in Network Troubleshooter", detail: "Right-click the network icon in your taskbar and select 'Diagnose network problems' (Windows) or run Wireless Diagnostics (Mac Option+Click Wi-Fi)." },
      { title: "Flush DNS Cache (Safe Command)", detail: "Open Command Prompt and run 'ipconfig /flushdns' then press Enter. This clears outdated website address records." }
    ],
    safetyAndIspAdvice: "Do NOT use a paperclip to press the tiny factory reset hole on your router, as this erases your Wi-Fi name and password completely. If all devices are offline and the router shows red lights, contact your Internet Service Provider (ISP) to check for neighborhood outages."
  };
}

// Fallback generator for IT Email
function getFallbackEmail(
  emailType: string,
  tone: string,
  issueTitle: string,
  category: string,
  description: string,
  stepsAttempted: string = '',
  impactLevel: string = 'Medium',
  ticketNumber: string = '',
  recipient: string = 'IT Support Team',
  userName: string = 'User'
) {
  const isFormal = tone === 'formal';
  const ref = ticketNumber ? ` [Ref: ${ticketNumber}]` : '';

  let subject = '';
  let body = '';

  if (emailType === 'resolution_confirmation') {
    subject = isFormal 
      ? `[Resolved] Technical Issue: ${issueTitle}${ref}`
      : `Confirmed Resolved: ${issueTitle}${ref}`;
    body = isFormal
      ? `Dear ${recipient},

I am writing to confirm that the issue regarding "${issueTitle}" has been successfully resolved.

Issue Summary:
• Ticket Reference: ${ticketNumber || 'N/A'}
• Category: ${category}
• Resolution Status: Verified and Working

Thank you for your prompt assistance and support in resolving this matter.

Best regards,
${userName}`
      : `Hi ${recipient},

Just wanted to let you know that the issue with "${issueTitle}" is now fixed and working properly on my end.

Thanks a lot for your help!

Best,
${userName}`;
  } else if (emailType === 'issue_follow_up') {
    subject = isFormal
      ? `[Follow-Up] Status Update Request: ${issueTitle}${ref}`
      : `Quick follow-up on ${issueTitle}${ref}`;
    body = isFormal
      ? `Dear ${recipient},

I hope this email finds you well. I am following up on ticket ${ticketNumber || issueTitle} submitted regarding "${issueTitle}".

Current Status:
• Impact Level: ${impactLevel}
• Problem Summary: ${description}

Could you please provide an estimated timeframe or update on the resolution of this issue? Please let me know if any further logs or testing are needed from my end.

Thank you for your continued help.

Sincerely,
${userName}`
      : `Hi ${recipient},

Checking in on the status of "${issueTitle}". It's still impacting my workflow (${impactLevel} priority).

Please let me know if you have an update or need me to try anything else.

Thanks,
${userName}`;
  } else {
    // Technical Issue Report or IT Support Request
    subject = isFormal
      ? `[IT Support Request] ${issueTitle}${ref}`
      : `Assistance needed: ${issueTitle}${ref}`;
    body = isFormal
      ? `Dear ${recipient},

I am writing to report a technical issue regarding: "${issueTitle}".

Issue Overview:
• Category: ${category}
• Priority / Impact Level: ${impactLevel}
• Description: ${description}
${stepsAttempted ? `• Troubleshooting Steps Attempted:\n  - ${stepsAttempted}\n` : ''}
Could you please look into this or advise on next steps? I am ready to provide additional system diagnostic information if required.

Thank you for your time and assistance.

Sincerely,
${userName}`
      : `Hi ${recipient},

I'm experiencing an issue with "${issueTitle}" and would appreciate your help.

Details:
${description}
${stepsAttempted ? `\nWhat I've already tested:\n- ${stepsAttempted}\n` : ''}
Priority: ${impactLevel}

Please let me know what I should do next to get this resolved.

Thank you!
${userName}`;
  }

  return {
    subject,
    body,
    tips: [
      "Include any relevant error codes, timestamps, and screenshots when sending this email.",
      "Mention your device hostname or office desk location if you are on a corporate network.",
      "Check your spam or junk folder for replies from the ticketing system."
    ]
  };
}

// Endpoint 2: Software Problem Analyzer
app.post('/api/analyze-software', async (req: Request, res: Response) => {
  try {
    const { softwareName, issueDescription, os = 'Windows/macOS', errorCode = '' } = req.body;

    if (!softwareName || !issueDescription) {
      return res.status(400).json({ error: 'Please provide both the software name and the issue description.' });
    }

    if (!ai) {
      return res.json(getFallbackSoftwareAnalysis(softwareName, issueDescription, errorCode));
    }

    const prompt = `Analyze this software problem for a beginner computer user:
Software Name: "${softwareName}"
Error Code/Message: "${errorCode}"
Problem Details: "${issueDescription}"
Operating System: "${os}"

Format your output as a strictly valid JSON object:
{
  "softwareName": "${softwareName}",
  "identifiedIssue": "Plain English summary of the issue",
  "explanation": "Simple explanation of why this happens without difficult jargon",
  "causes": ["Possible cause 1", "Possible cause 2", "Possible cause 3"],
  "steps": [
    {
      "title": "Actionable step title",
      "detail": "Beginner-friendly step details"
    }
  ],
  "whatNotToDo": ["Hazard or bad advice to avoid (e.g. downloading random dlls)", "Another warning"],
  "whenToContactVendor": "Clear criteria for when the user should reach out to the app's official support"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: BASE_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/analyze-software:', error);
    const fallback = getFallbackSoftwareAnalysis(
      req.body?.softwareName || 'Application',
      req.body?.issueDescription || 'Software error',
      req.body?.errorCode || ''
    );
    return res.json(fallback);
  }
});

// Endpoint 3: Internet Connectivity Troubleshooter
app.post('/api/troubleshoot-network', async (req: Request, res: Response) => {
  try {
    const { symptom, connectionType = 'wifi', deviceType = 'PC/Laptop' } = req.body;

    if (!symptom) {
      return res.status(400).json({ error: 'Please specify the internet problem.' });
    }

    if (!ai) {
      return res.json(getFallbackNetworkDiagnosis(symptom, connectionType));
    }

    const prompt = `A user is experiencing internet connectivity issues:
Symptom: "${symptom}"
Connection Type: "${connectionType}"
Device: "${deviceType}"

Provide structured, safe, beginner-friendly internet troubleshooting guidance.
Return strictly valid JSON:
{
  "symptom": "${symptom}",
  "connectionType": "${connectionType}",
  "diagnosticSummary": "Clear 1-2 sentence explanation of what could be failing",
  "quickChecks": [
    { "check": "Simple 10-second inspection", "tip": "What to look for" }
  ],
  "steps": [
    { "title": "Step title", "detail": "Gentle, non-intimidating instructions" }
  ],
  "safetyAndIspAdvice": "Safety precautions and when to call the ISP"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: BASE_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/troubleshoot-network:', error);
    const fallback = getFallbackNetworkDiagnosis(req.body?.symptom || 'Network issue', req.body?.connectionType || 'wifi');
    return res.json(fallback);
  }
});

// Endpoint 4: Professional IT Support Email Generator
app.post('/api/generate-email', async (req: Request, res: Response) => {
  try {
    const {
      emailType = 'technical_issue_report',
      tone = 'formal',
      issueTitle,
      category = 'General',
      description,
      stepsAttempted = '',
      impactLevel = 'Medium',
      ticketNumber = '',
      recipient = 'IT Support Team',
      userName = 'User'
    } = req.body;

    if (!issueTitle || !description) {
      return res.status(400).json({ error: 'Issue title and description are required to generate an email.' });
    }

    if (!ai) {
      return res.json(getFallbackEmail(
        emailType,
        tone,
        issueTitle,
        category,
        description,
        stepsAttempted,
        impactLevel,
        ticketNumber,
        recipient,
        userName
      ));
    }

    const prompt = `Generate a professional IT email.
Email Type: ${emailType} (Options: technical_issue_report, it_support_request, issue_follow_up, resolution_confirmation)
Communication Tone: ${tone} (Options: formal corporate OR simple/friendly beginner)
Issue Title: "${issueTitle}"
Category: "${category}"
Description: "${description}"
Steps Attempted: "${stepsAttempted || 'None specified'}"
Impact/Priority: "${impactLevel}"
Ticket Number: "${ticketNumber || 'N/A'}"
Recipient: "${recipient}"
Sender Name: "${userName}"

Generate a polished email subject and ready-to-send email body.
Output format: strictly valid JSON:
{
  "subject": "Clear, professional email subject line",
  "body": "Complete, beautifully formatted email text ready to send",
  "tips": ["Helpful tip for communication with IT", "Another tip"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: BASE_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/generate-email:', error);
    const fallback = getFallbackEmail(
      req.body?.emailType || 'technical_issue_report',
      req.body?.tone || 'formal',
      req.body?.issueTitle || 'Technical Issue',
      req.body?.category || 'General',
      req.body?.description || 'Problem occurred',
      req.body?.stepsAttempted || '',
      req.body?.impactLevel || 'Medium',
      req.body?.ticketNumber || '',
      req.body?.recipient || 'IT Support Team',
      req.body?.userName || 'User'
    );
    return res.json(fallback);
  }
});

// Setup Vite middlewares in development or static assets in production
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TechCare AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
