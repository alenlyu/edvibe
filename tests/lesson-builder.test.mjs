import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';

// Exercise the actual course/assessment code without a browser or dependencies.
const storage = new Map();
const context = vm.createContext({
  window: {}, crypto: webcrypto, console, TextEncoder, URL, URLSearchParams,
  setTimeout, clearTimeout, setInterval, clearInterval,
  localStorage: { getItem: k => storage.get(k) || null, setItem: (k, v) => storage.set(k, v) },
  document: { querySelector: () => null, querySelectorAll: () => [] },
  CSS: { escape: s => s },
  assert,
});
for (const filename of ['dictionary.js', 'lessons.js', 'app.js']) {
  let source = fs.readFileSync(new URL('../dist/' + filename, import.meta.url), 'utf8');
  if (filename === 'app.js') source = source.slice(0, source.indexOf("document.addEventListener('click'"));
  vm.runInContext(source, context, { filename });
}
vm.runInContext(`
  assert.equal(EXERCISE_TYPES.length, 27);
  assert.equal(new Set(EXERCISE_TYPES.map(t=>t.id)).size,27);

  // Every complete template must produce a valid, exportable course.
  for(const key of Object.keys(LESSON_TOPICS)){
    const l=createTemplateLesson(key);
    assert.equal(allExercises(l).length,10);
    for(const e of allExercises(l)) assert.equal(validateExercise(e),'',key+' '+e.type);
    const c=baseCourse();c.sections[0].lessons.push(l);
    assert.equal(validateBackup({course:c}).title,'Chinese easy');
  }

  // Reject malformed assessments rather than silently creating ungradable work.
  assert.ok(validateExercise({...exerciseDefaults('gaps'),body:'No gap here'}));
  assert.ok(validateExercise({...exerciseDefaults('quiz'),body:'Question | Same | same'}));
  assert.ok(validateExercise({...exerciseDefaults('sorting'),body:'水 | Unknown'}));
  assert.throws(()=>validateBackup({...baseCourse(),sections:[{id:'bad',name:'S',lessons:[{id:'l',name:'L',sections:[]}]}]}));
  const duplicate=baseCourse();duplicate.sections.push(clone(duplicate.sections[0]));
  assert.throws(()=>validateBackup(duplicate));

  // Real grading: alternate answers, fullwidth input and multiple Chinese gaps.
  course=baseCourse();ui.lessonId='lesson-first';ui.partId='part-first';ui.page='lesson';
  const put=e=>{currentPart().exercises.push(e);return e;};
  const gap=put({...exerciseDefaults('gaps'),body:'[你好/您好]！我[叫]安娜。'});
  response(gap.id).answers=['您好','叫'];checkExercise(gap.id);
  assert.equal(response(gap.id).score,2);assert.equal(response(gap.id).correct,true);
  response(gap.id).answers=['错','叫'];checkExercise(gap.id);
  assert.equal(response(gap.id).score,1);assert.equal(response(gap.id).correct,false);
  assert.equal(norm('ＡＢＣ！'),'abc');

  for(const type of ['quiz','truefalse','sorting','tones']){
    const e=put(exerciseDefaults(type));response(e.id).answers=cells(e.body).map(r=>r[1]);
    checkExercise(e.id);assert.equal(response(e.id).correct,true,type);
    response(e.id).answers[0]='wrong';checkExercise(e.id);
    assert.equal(response(e.id).correct,false,type+' wrong answer');
  }
  for(const type of ['order','textorder','unscramble']){
    const e=put(exerciseDefaults(type));response(e.id).order=getOrderRows(e).map(row=>row.map((_,i)=>i));
    checkExercise(e.id);assert.equal(response(e.id).correct,true,type);
    response(e.id).order[0].reverse();checkExercise(e.id);assert.equal(response(e.id).correct,false,type+' incorrect order');
  }
  const matching=put(exerciseDefaults('matching'));
  cells(matching.body).forEach((_,i)=>response(matching.id).matches[i]=i);
  checkExercise(matching.id);assert.equal(response(matching.id).correct,true);
  const writing=put(exerciseDefaults('writing'));response(writing.id).answers=['你好！我叫安娜。'];
  checkExercise(writing.id);assert.equal(response(writing.id).manual,true);assert.equal(response(writing.id).correct,false);

  // Duplication preserves content and gives every editable record a fresh ID.
  const duplicated=duplicateLesson(lesson());
  assert.notEqual(duplicated.id,lesson().id);
  assert.notEqual(duplicated.sections[0].exercises[0].id,gap.id);
  assert.equal(duplicated.sections[0].exercises[0].body,gap.body);

  // Unsafe sources are not inserted into HTML; dictionary directions are real.
  assert.equal(safeUrl('javascript:alert(1)'),'');
  assert.equal(safeUrl('data:text/html,test'),'');
  assert.equal(safeUrl('//example.com'),'');
  assert.equal(safeUrl('assets/audio/hello.mp3'),'assets/audio/hello.mp3');
  assert.equal(dictionaryLookup('你好！','zh-CN','en').text,'hello');
  assert.equal(dictionaryLookup('спасибо','ru','zh-CN').text,'谢谢');
  assert.equal(pinyinFor('你好'),'nǐ hǎo');
  assert.equal(writingCount('你好 hello'),'2 Chinese characters · 1 other words');
  assert.equal(writingCount('你好！我叫安娜。'),'6 Chinese characters · 0 other words');

  // All renderer branches accept valid authored content in both views.
  for(const t of EXERCISE_TYPES){const e=exerciseDefaults(t.id);assert.equal(typeof exerciseContent(e,response(e.id)),'string');}
  console.log('PASS: templates, import validation, grading, duplication, dictionary, URLs and 27 renderers');
`, context);

// Parse the exact standalone export, including hostile text, and check that
// teacher-only data never reaches a student's copy.
context.exportFiles = ['styles.css', 'dictionary.js', 'lessons.js', 'app.js'].map(name =>
  fs.readFileSync(new URL('../dist/' + name, import.meta.url), 'utf8'));
const studentHTML = vm.runInContext(`
  const exportedCourseData=baseCourse(),exportLesson=createTemplateLesson('greetings');
  exportLesson.notes='PRIVATE_TEACHER_NOTE';
  exportLesson.sections[0].exercises.push({...exerciseDefaults('note'),hidden:true,body:'PRIVATE_HIDDEN_EXERCISE'});
  exportLesson.sections[0].exercises[0].body='<img onerror=alert(1)> </script> 你好';
  studentDocument(exportedCourseData,exportLesson,exportFiles);
`, context);
assert.ok(!studentHTML.includes('PRIVATE_TEACHER_NOTE'));
assert.ok(!studentHTML.includes('PRIVATE_HIDDEN_EXERCISE'));
const scripts = [...studentHTML.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
assert.equal(scripts.length, 4);
for (const script of scripts) new vm.Script(script);
const studentState = vm.createContext({window:{}});
vm.runInContext(scripts[0], studentState);
assert.equal(studentState.window.CHINESE_STUDENT.course.sections[0].lessons[0].sections[0].exercises.length, 8);
console.log('PASS: standalone HTML export parses and excludes teacher-only data');
