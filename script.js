// script.js - STOP THE FOLLOW
// Questions list (12)
const QUESTIONS = [
  "Are you feeling scared right now?",
  "Has this person bothered or harassed you or anyone else in the past?",
  "Has this person ever damaged, destroyed, or tampered with your property or belongings?",
  "Does this person show up at your home, work, or other places you go often more than three times a week?",
  "Has this person hung around near your home, work, or other places you visit?",
  "Has this person threatened you or anyone else with physical or sexual harm during these incidents?",
  "Has this person harassed anyone else (friends, family, children, coworkers, partners, or neighbors) since the harassment began?",
  "Has this person acted violently toward anyone else during these stalking incidents?",
  "Has this person tried to get others to help them, whether they knew it or not?",
  "Does this person use drugs or alcohol in a way that could be harmful or risky?",
  "Has this person been violent in the past, either physically or emotionally?",
  "Has this person used technology or the internet to track, monitor, impersonate, or harass you, such as GPS, spyware, social media, or fake accounts?"
];

// Risk weights: assign numeric scores (higher = more risk)
const WEIGHTS = [
  3, // Q1 fear - high
  3, // Q2 past harassment - high
  2, // Q3 property damage - moderate
  2, // Q4 frequent contact - moderate
  2, // Q5 loitering - moderate
  3, // Q6 threats - high
  2, // Q7 third-party harassment - moderate
  3, // Q8 violent acts to others - high
  2, // Q9 using others - moderate
  2, // Q10 substance misuse - moderate
  3, // Q11 past violence - high
  3  // Q12 tech-assisted stalking - high
];

const questionsContainer = document.getElementById('questions');
const resultBlock = document.getElementById('result');
const riskLevelEl = document.getElementById('riskLevel');
const riskExplanationEl = document.getElementById('riskExplanation');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const downloadTextBtn = document.getElementById('downloadTextBtn');
const deleteBtn = document.getElementById('deleteBtn');
const saveLocalBtn = document.getElementById('saveLocalBtn');
const quickExitBtn = document.getElementById('quickExit');
const resourcesLink = document.getElementById('resourcesLink');

// Build question UI
function buildQuestions() {
  QUESTIONS.forEach((q, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    const qText = document.createElement('p');
    qText.textContent = q;
    qText.className = 'qtext';
    const btnYes = document.createElement('button');
    btnYes.textContent = 'Yes';
    btnYes.className = 'btn-yes';
    btnYes.onclick = () => selectAnswer(i, true, btnYes, btnNo);
    const btnNo = document.createElement('button');
    btnNo.textContent = 'No';
    btnNo.className = 'btn-no';
    btnNo.onclick = () => selectAnswer(i, false, btnYes, btnNo);
    card.appendChild(qText);
    const btns = document.createElement('div');
    btns.className = 'btn-row';
    btns.appendChild(btnYes);
    btns.appendChild(btnNo);
    card.appendChild(btns);
    questionsContainer.appendChild(card);

    // store references
    // initialize state
    state.answers[i] = null;
  });
  // add submit button
  const submit = document.createElement('button');
  submit.id = 'submitBtn';
  submit.textContent = 'Get Risk Level';
  submit.onclick = computeRisk;
  submit.className = 'submit';
  questionsContainer.appendChild(submit);
}

// state
const state = {
  answers: [], // true/false/null
  risk: null,
  explanation: '',
};

// select answer
function selectAnswer(index, val, yesBtn, noBtn) {
  state.answers[index] = val;
  if (val) {
    yesBtn.classList.add('selected');
    noBtn.classList.remove('selected');
  } else {
    noBtn.classList.add('selected');
    yesBtn.classList.remove('selected');
  }
}

// compute risk
function computeRisk() {
  // ensure at least one answered
  if (state.answers.every(a => a === null)) {
    alert('Please answer at least one question.');
    return;
  }
  let score = 0;
  let maxPossible = 0;
  for (let i=0;i<QUESTIONS.length;i++) {
    maxPossible += WEIGHTS[i];
    if (state.answers[i]) score += WEIGHTS[i];
  }

  // Determine thresholds based on weighted percentage
  const pct = (score / maxPossible) * 100;
  let level = 'Low';
  let expl = 'Low risk based on your answers. Continue to use caution and consider local resources if concerned.';
  if (pct >= 60) {
    level = 'High';
    expl = 'High risk. Consider contacting authorities, a trusted advocate, or local services immediately.';
  } else if (pct >= 35) {
    level = 'Moderate';
    expl = 'Moderate risk. Increase caution and consider safety planning and evidence collection.';
  }
  state.risk = level;
  state.explanation = expl;
  showResult();
  // analytics - increment local download counter marker (track interactions)
  incrementCounter('assessments_completed');
}

// show result
function showResult() {
  riskLevelEl.textContent = state.risk;
  riskExplanationEl.textContent = state.explanation;
  resultBlock.classList.remove('hidden');
  // scroll to result
  resultBlock.scrollIntoView({behavior:'smooth'});
}

// Downloads
async function generatePdf(alias='') {
  const el = resultBlock;
  // clone and style for PDF
  const clone = el.cloneNode(true);
  clone.style.background = 'white';
  // temporarily append
  document.body.appendChild(clone);
  const canvas = await html2canvas(clone, {scale:2, useCORS:true});
  document.body.removeChild(clone);
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p','mm','a4');
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  // watermark alias if provided
  if (alias) {
    const text = `${alias} - ${new Date().toLocaleDateString()}`;
    pdf.setFontSize(10);
    pdf.setTextColor(120);
    pdf.text(text, 10, pdf.internal.pageSize.getHeight() - 10);
  }
  return pdf.output('arraybuffer');
}

function downloadBlob(data, filename, mime) {
  const blob = new Blob([data], {type: mime || 'application/octet-stream'});
  saveAs(blob, filename);
}

document.getElementById('downloadPdfBtn').addEventListener('click', async () => {
  const alias = document.getElementById('alias').value || '';
  const arr = await generatePdf(alias);
  downloadBlob(arr, `safety-plan-${new Date().toISOString().slice(0,10)}.pdf`, 'application/pdf');
  incrementCounter('download_pdf');
});

document.getElementById('downloadTextBtn').addEventListener('click', () => {
  const text = buildTextExport();
  downloadBlob(text, `safety-plan-${new Date().toISOString().slice(0,10)}.txt`, 'text/plain');
  incrementCounter('download_txt');
});

function buildTextExport() {
  let out = 'STOP THE FOLLOW - Safety Plan\\n';
  out += 'Date: ' + new Date().toLocaleString() + '\\n\\n';
  QUESTIONS.forEach((q,i) => {
    const ans = state.answers[i] === true ? 'Yes' : state.answers[i] === false ? 'No' : 'Unanswered';
    out += `${i+1}. ${q} - ${ans}\\n`;
  });
  out += `\\nRisk Level: ${state.risk}\\n`;
  out += `Notes: ${state.explanation}\\n`;
  return out;
}

// Save / Delete
deleteBtn.addEventListener('click', () => {
  if (!confirm('Delete all answers and results? This cannot be undone.')) return;
  state.answers = state.answers.map(() => null);
  state.risk = null;
  state.explanation = '';
  // reset UI
  const selected = document.querySelectorAll('.selected');
  selected.forEach(s => s.classList.remove('selected'));
  resultBlock.classList.add('hidden');
  incrementCounter('deleted');
});

saveLocalBtn.addEventListener('click', () => {
  const data = {
    answers: state.answers,
    risk: state.risk,
    explanation: state.explanation,
    date: new Date().toISOString()
  };
  localStorage.setItem('stopthefollow_saved', JSON.stringify(data));
  alert('Results saved locally on this device.');
  incrementCounter('saved_local');
});

// Quick exit
quickExitBtn.addEventListener('click', () => {
  window.location.href = 'https://weather.com';
});

// Simple local analytics counter - stores aggregated counts in localStorage
function incrementCounter(key) {
  try {
    const counts = JSON.parse(localStorage.getItem('stf_counts') || '{}');
    counts[key] = (counts[key] || 0) + 1;
    localStorage.setItem('stf_counts', JSON.stringify(counts));
  } catch (e) {
    console.error(e);
  }
}

// init
buildQuestions();
