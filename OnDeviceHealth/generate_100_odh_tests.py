from pathlib import Path
from string import Template

root = Path(__file__).resolve().parent
root.mkdir(exist_ok=True)
tests_dir = root / 'tests'
tests_dir.mkdir(exist_ok=True)

subjects = [
    'Attention', 'Social Interaction', 'Stress', 'Sleep', 'Memory', 'Focus', 'Mood',
    'Energy', 'Clarity', 'Routine', 'Hydration', 'Vision Comfort', 'Posture',
    'Noise Sensitivity', 'Task Planning', 'Work Pace', 'Recovery', 'Balance',
    'Impulse Control', 'Learning', 'Motivation', 'Nervous Energy', 'Relaxation',
    'Breathing', 'Diet Habits', 'Screen Time', 'Physical Comfort', 'Emotional Balance',
    'Concentration', 'Reaction', 'Creativity', 'Adaptability', 'Sensitivity',
    'Productivity', 'Confidence', 'Stretching', 'Alertness', 'Organization',
    'Time Management'
]
modifiers = ['Check', 'Survey', 'Score', 'Review', 'Insight']

titles = [f"{subj} {mod}" for subj in subjects for mod in modifiers][:100]
subjects_for_questions = [subj for subj in subjects for _ in modifiers][:100]

page_template = Template('''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>$title</title>
  <style>
    body {{ margin:0; font-family:Segoe UI, Arial, sans-serif; background:#f7f8fc; color:#111; }}
    .page {{ max-width:760px; margin:0 auto; padding:24px; }}
    header {{ text-align:center; margin-bottom:24px; }}
    h1 {{ margin:0; font-size:2rem; }}
    .card {{ background:#fff; border-radius:18px; box-shadow:0 16px 32px rgba(15,25,45,.08); padding:24px; }}
    .question {{ margin-bottom:18px; }}
    .question label {{ display:block; margin-bottom:8px; font-weight:600; }}
    .options {{ display:flex; gap:12px; flex-wrap:wrap; }}
    .option {{ display:flex; align-items:center; gap:8px; }}
    .button-row {{ margin-top:20px; display:flex; flex-wrap:wrap; gap:12px; }}
    button {{ background:#2563eb; color:#fff; border:none; border-radius:10px; padding:12px 18px; cursor:pointer; font-size:1rem; }}
    button:hover {{ background:#1f4fb0; }}
    .result {{ margin-top:24px; padding:18px; border-radius:14px; background:#eef6ff; border:1px solid #cce0ff; }}
    a {{ color:#2563eb; text-decoration:none; }}
    a:hover {{ text-decoration:underline; }}
    .note {{ color:#444; font-size:.95rem; margin-top:12px; }}
  </style>
</head>
<body>
  <div class="page">
    <header>
      <h1>$title</h1>
      <p>Answer five statements and tap Calculate to see a local score from 0 to 5.</p>
    </header>
    <div class="card">
      <form id="testForm">
        $questions
        <div class="button-row">
          <button type="button" id="calculateButton">Calculate</button>
          <a href="../index.html">Back to ODH home</a>
        </div>
        <div id="resultBox" class="result" style="display:none;"></div>
        <p class="note">No data leaves your browser. This is a local score only.</p>
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
      resultBox.innerHTML = `<strong>Score:</strong> $${score} / 5<br><strong>Meaning:</strong> 0 = unlikely, 5 = likely.`;
    });
  </script>
</body>
</html>
''')

question_templates = [
    'I notice {subject} affecting my comfort or focus.',
    'I feel challenged by {subject} during daily tasks.',
    'I make choices with {subject} in mind.',
    'I feel my {subject} takes extra effort right now.',
    'I would like to improve my {subject} level.'
]

for i, (title, subject) in enumerate(zip(titles, subjects_for_questions), start=1):
    questions_html = []
    for q, template in enumerate(question_templates, start=1):
        questions_html.append(f"""
        <div class=\"question\">
          <label>{template.format(subject=subject.lower())}</label>
          <div class=\"options\">
            <label class=\"option\"><input type=\"radio\" name=\"q{q}\" value=\"1\"> Yes</label>
            <label class=\"option\"><input type=\"radio\" name=\"q{q}\" value=\"0\" checked> No</label>
          </div>
        </div>
        """)
    page_html = page_template.substitute(title=title, questions=''.join(questions_html))
    tests_dir.joinpath(f'test{i:03}.html').write_text(page_html, encoding='utf-8')

link_template = '<a href="tests/test{num:03}.html">{title}</a>'
links_html = '\n        '.join(link_template.format(num=i, title=title) for i, title in enumerate(titles, start=1))

index_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>On Device Health</title>
  <style>
    body {{ margin: 0; font-family:Segoe UI, Arial, sans-serif; background:#f4f7fb; color:#1a1a1a; }}
    .page {{ max-width:1000px; margin:0 auto; padding:28px; }}
    header {{ text-align:center; padding:18px 0; }}
    h1 {{ margin:0; font-size:2.4rem; }}
    p {{ line-height:1.65; margin:18px 0; }}
    .card {{ background:#fff; border-radius:18px; box-shadow:0 18px 35px rgba(15,25,45,.08); padding:24px; margin-top:24px; }}
    .links {{ column-count: 3; column-gap: 24px; max-width:100%; }}
    .links a {{ display:block; margin-bottom:10px; color:#2563eb; text-decoration:none; }}
    .links a:hover {{ text-decoration:underline; }}
    footer {{ text-align:center; margin-top:32px; color:#555; font-size:.95rem; }}
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
        {links_html}
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
'''

root.joinpath('index.html').write_text(index_html, encoding='utf-8')
print(f'Created {len(titles)} test pages and updated index.html')
