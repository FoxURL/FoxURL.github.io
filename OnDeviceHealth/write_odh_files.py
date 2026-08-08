from pathlib import Path
root = Path(__file__).resolve().parent
root.mkdir(exist_ok=True)
tests = root / 'tests'
tests.mkdir(exist_ok=True)
root.joinpath('index.html').write_text(r'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>On Device Health</title>
  <style>
    body { margin: 0; font-family:Segoe UI, Arial, sans-serif; background:#f4f7fb; color:#1a1a1a; }
    .page { max-width:820px; margin:0 auto; padding:28px; }
    header { text-align:center; padding:18px 0; }
    h1 { margin:0; font-size:2.4rem; }
    p { line-height:1.65; margin:18px 0; }
    .card { background:#fff; border-radius:18px; box-shadow:0 18px 35px rgba(15,25,45,.08); padding:24px; margin-top:24px; }
    .links a { display:inline-block; margin:12px 12px 0 0; padding:12px 18px; background:#2563eb; color:#fff; text-decoration:none; border-radius:10px; }
    .links a:hover { background:#1e4bb8; }
    footer { text-align:center; margin-top:32px; color:#555; font-size:.95rem; }
  </style>
</head>
<body>
  <div class="page">
    <header>
      <h1>On Device Health</h1>
      <p>A small local health check. No data leaves your browser. Answer a few statements, tap calculate, and get an instant score from 0 (unlikely) to 5 (likely).</p>
    </header>
    <div class="card">
      <h2>Start a test</h2>
      <div class="links">
        <a href="tests/AttentionDeficitHyperactivityDisorder.html">Attention & Focus</a>
        <a href="tests/AutismSpectrumDisorder.html">Social & Sensory</a>
      </div>
      <p>Each page is a local test stored only in your browser session. The score is a fast estimate only, not a diagnosis.</p>
    </div>
    <div class="card">
      <h2>How it works</h2>
      <p>Answer five questions on the selected page. When you finish, press Calculate. The tool adds your answers and shows a value from 0 to 5.</p>
      <p>0 = unlikely, 5 = likely. No waiting, no network requests, and no data is sent anywhere.</p>
    </div>
    <footer>Built for fast local use only. No server needed.</footer>
  </div>
</body>
</html>
''', encoding='utf-8')

attention = r'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Attention Deficit / Hyperactivity</title>
  <style>
    body { margin:0; font-family:Segoe UI, Arial, sans-serif; background:#eef2fb; color:#111; }
    .page { max-width:760px; margin:0 auto; padding:24px; }
    header { text-align:center; margin-bottom:24px; }
    h1 { margin:0; font-size:2rem; }
    .card { background:#fff; border-radius:18px; box-shadow:0 16px 32px rgba(15,25,45,.08); padding:24px; }
    .question { margin-bottom:18px; }
    .question label { display:block; margin-bottom:8px; font-weight:600; }
    .options { display:flex; gap:12px; flex-wrap:wrap; }
    .option { display:flex; align-items:center; gap:8px; }
    .button-row { margin-top:20px; display:flex; flex-wrap:wrap; gap:12px; }
    button { background:#2563eb; color:#fff; border:none; border-radius:10px; padding:12px 18px; cursor:pointer; font-size:1rem; }
    button:hover { background:#1f4fb0; }
    .result { margin-top:24px; padding:18px; border-radius:14px; background:#eef6ff; border:1px solid #cce0ff; }
    a { color:#2563eb; text-decoration:none; }
    a:hover { text-decoration:underline; }
    .note { color:#444; font-size:.95rem; margin-top:12px; }
  </style>
</head>
<body>
  <div class="page">
    <header>
      <h1>Attention & Hyperactivity</h1>
      <p>Answer five statements, then press Calculate to see your score from 0 to 5.</p>
    </header>
    <div class="card">
      <form id="testForm">
        <div class="question">
          <label>1. I find it hard to stay focused on one task for several minutes.</label>
          <div class="options">
            <label class="option"><input type="radio" name="q1" value="1"> Yes</label>
            <label class="option"><input type="radio" name="q1" value="0" checked> No</label>
          </div>
        </div>
        <div class="question">
          <label>2. I often feel restless or like I need to move.</label>
          <div class="options">
            <label class="option"><input type="radio" name="q2" value="1"> Yes</label>
            <label class="option"><input type="radio" name="q2" value="0" checked> No</label>
          </div>
        </div>
        <div class="question">
          <label>3. I tend to start multiple tasks without finishing them.</label>
          <div class="options">
            <label class="option"><input type="radio" name="q3" value="1"> Yes</label>
            <label class="option"><input type="radio" name="q3" value="0" checked> No</label>
          </div>
        </div>
        <div class="question">
          <label>4. I notice I forget details or miss steps in everyday routines.</label>
          <div class="options">
            <label class="option"><input type="radio" name="q4" value="1"> Yes</label>
            <label class="option"><input type="radio" name="q4" value="0" checked> No</label>
          </div>
        </div>
        <div class="question">
          <label>5. I feel distracted by sounds, sights, or thoughts while working.</label>
          <div class="options">
            <label class="option"><input type="radio" name="q5" value="1"> Yes</label>
            <label class="option"><input type="radio" name="q5" value="0" checked> No</label>
          </div>
        </div>
        <div class="button-row">
          <button type="button" id="calculateButton">Calculate</button>
          <a href="../index.html">Back to ODH home</a>
        </div>
        <div id="resultBox" class="result" style="display:none;"></div>
        <p class="note">No data is sent anywhere. This is a local score only.</p>
      </form>
    </div>
  </div>
  <script>
    const form = document.getElementById('testForm');
    const resultBox = document.getElementById('resultBox');
    document.getElementById('calculateButton').addEventListener('click', () => {
      const values = [1,2,3,4,5].map(i => Number(form['q' + i].value));
      const score = values.reduce((sum, value) => sum + value, 0);
      resultBox.style.display = 'block';
      resultBox.innerHTML = `<strong>Score:</strong> ${score} / 5<br><strong>Meaning:</strong> 0 = unlikely, 5 = likely.`;
    });
  </script>
</body>
</html>
'''

tests.joinpath('AttentionDeficitHyperactivityDisorder.html').write_text(attention, encoding='utf-8')

autism = r'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Autism Spectrum</title>
  <style>
    body { margin:0; font-family:Segoe UI, Arial, sans-serif; background:#f7f6f2; color:#111; }
    .page { max-width:760px; margin:0 auto; padding:24px; }
    header { text-align:center; margin-bottom:24px; }
    h1 { margin:0; font-size:2rem; }
    .card { background:#fff; border-radius:18px; box-shadow:0 16px 32px rgba(15,25,45,.08); padding:24px; }
    .question { margin-bottom:18px; }
    .question label { display:block; margin-bottom:8px; font-weight:600; }
    .options { display:flex; gap:12px; flex-wrap:wrap; }
    .option { display:flex; align-items:center; gap:8px; }
    .button-row { margin-top:20px; display:flex; flex-wrap:wrap; gap:12px; }
    button { background:#2563eb; color:#fff; border:none; border-radius:10px; padding:12px 18px; cursor:pointer; font-size:1rem; }
    button:hover { background:#1f4fb0; }
    .result { margin-top:24px; padding:18px; border-radius:14px; background:#eef6ff; border:1px solid #cce0ff; }
    a { color:#2563eb; text-decoration:none; }
    a:hover { text-decoration:underline; }
    .note { color:#444; font-size:.95rem; margin-top:12px; }
  </style>
</head>
<body>
  <div class="page">
    <header>
      <h1>Social & Sensory</h1>
      <p>Answer five statements, then press Calculate to see your score from 0 to 5.</p>
    </header>
    <div class="card">
      <form id="testForm">
        <div class="question">
          <label>1. I prefer clear routines and feel upset when plans change.</label>
          <div class="options">
            <label class="option"><input type="radio" name="q1" value="1"> Yes</label>
            <label class="option"><input type="radio" name="q1" value="0" checked> No</label>
          </div>
        </div>
        <div class="question">
          <label>2. I find social conversations tiring or hard to follow.</label>
          <div class="options">
            <label class="option"><input type="radio" name="q2" value="1"> Yes</label>
            <label class="option"><input type="radio" name="q2" value="0" checked> No</label>
          </div>
        </div>
        <div class="question">
          <label>3. I notice sensory input like lights, sounds, or textures more strongly.</label>
          <div class="options">
            <label class="option"><input type="radio" name="q3" value="1"> Yes</label>
            <label class="option"><input type="radio" name="q3" value="0" checked> No</label>
          </div>
        </div>
        <div class="question">
          <label>4. I often prefer working alone or on very focused interests.</label>
          <div class="options">
            <label class="option"><input type="radio" name="q4" value="1"> Yes</label>
            <label class="option"><input type="radio" name="q4" value="0" checked> No</label>
          </div>
        </div>
        <div class="question">
          <label>5. I use rules or patterns to make sense of everyday tasks.</label>
          <div class="options">
            <label class="option"><input type="radio" name="q5" value="1"> Yes</label>
            <label class="option"><input type="radio" name="q5" value="0" checked> No</label>
          </div>
        </div>
        <div class="button-row">
          <button type="button" id="calculateButton">Calculate</button>
          <a href="../index.html">Back to ODH home</a>
        </div>
        <div id="resultBox" class="result" style="display:none;"></div>
        <p class="note">No data is sent anywhere. This is a local score only.</p>
      </form>
    </div>
  </div>
  <script>
    const form = document.getElementById('testForm');
    const resultBox = document.getElementById('resultBox');
    document.getElementById('calculateButton').addEventListener('click', () => {
      const values = [1,2,3,4,5].map(i => Number(form['q' + i].value));
      const score = values.reduce((sum, value) => sum + value, 0);
      resultBox.style.display = 'block';
      resultBox.innerHTML = `<strong>Score:</strong> ${score} / 5<br><strong>Meaning:</strong> 0 = unlikely, 5 = likely.`;
    });
  </script>
</body>
</html>
'''

tests.joinpath('AutismSpectrumDisorder.html').write_text(autism, encoding='utf-8')
''', encoding='utf-8')
