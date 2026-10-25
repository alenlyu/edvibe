const EXERCISE_TYPES = [
  {id:'text',name:'Text',desc:'Chinese, pinyin & translation',group:'Reading & writing',icon:'text'},
  {id:'article',name:'Article',desc:'A reading with an optional picture',group:'Reading & writing',icon:'article'},
  {id:'writing',name:'Writing',desc:'Free response & a word counter',group:'Reading & writing',icon:'edit'},
  {id:'audio',name:'Listening',desc:'MP3 path, transcript & speed',group:'Audio & pictures',icon:'headphones'},
  {id:'video',name:'Video',desc:'YouTube, Vimeo or a video file',group:'Audio & pictures',icon:'video'},
  {id:'image',name:'Picture',desc:'Add a picture & caption',group:'Audio & pictures',icon:'image'},
  {id:'speaking',name:'Voice recording',desc:'Record & download speaking practice',group:'Audio & pictures',icon:'mic'},
  {id:'gaps',name:'Fill in the blanks',desc:'Type the missing words',group:'Words & gaps',icon:'gaps'},
  {id:'wordbank',name:'Gaps from a word bank',desc:'Drag or click words into gaps',group:'Words & gaps',icon:'box'},
  {id:'choicegaps',name:'Choose in the gaps',desc:'Pick a word from each dropdown',group:'Words & gaps',icon:'select'},
  {id:'labelpicture',name:'Label the pictures',desc:'Look at a picture & name it',group:'Words & gaps',icon:'image'},
  {id:'quiz',name:'Multiple choice',desc:'Create an auto-checked quiz',group:'Tests & ordering',icon:'clipboard'},
  {id:'timedquiz',name:'Timed test',desc:'A quiz with a countdown',group:'Tests & ordering',icon:'timer'},
  {id:'truefalse',name:'True or false',desc:'Decide if a statement is true',group:'Tests & ordering',icon:'check'},
  {id:'matching',name:'Match the words',desc:'Connect words with their meanings',group:'Tests & ordering',icon:'match'},
  {id:'order',name:'Word order',desc:'Build a sentence from words',group:'Tests & ordering',icon:'sort'},
  {id:'textorder',name:'Put the text in order',desc:'Rebuild a dialogue or story',group:'Tests & ordering',icon:'list'},
  {id:'unscramble',name:'Unscramble',desc:'Rearrange letters or characters',group:'Tests & ordering',icon:'shuffle'},
  {id:'sorting',name:'Sort into columns',desc:'Sort words into categories',group:'Tests & ordering',icon:'columns'},
  {id:'vocabulary',name:'Vocabulary list',desc:'Hanzi, pinyin & definitions',group:'Chinese tools',icon:'book'},
  {id:'flashcards',name:'Flashcards',desc:'Flip cards & practice recall',group:'Chinese tools',icon:'cards'},
  {id:'characters',name:'Character practice',desc:'Reference grids & typing practice',group:'Chinese tools',icon:'hanzi'},
  {id:'tones',name:'Tone practice',desc:'Identify Mandarin tones',group:'Chinese tools',icon:'wave'},
  {id:'note',name:'Note',desc:'A tip, reminder or teacher note',group:'Other',icon:'note'},
  {id:'link',name:'External link',desc:'Link to another learning resource',group:'Other',icon:'link'},
  {id:'embed',name:'Embedded activity',desc:'Wordwall, Quizlet & other embeds',group:'Other',icon:'embed'},
  {id:'divider',name:'Dividing line',desc:'Separate parts of your lesson',group:'Other',icon:'minus'}
];
function newId(){return globalThis.crypto?.randomUUID?.()||('id'+Date.now().toString(36)+Math.random().toString(36).slice(2,8));}
function baseCourse(){return {version:1,title:'Chinese easy',subtitle:'Your Textbook Mr. Alen',description:'Your own space for teaching Chinese. Organize your lessons into sections and fill them with interactive exercises.\n\nStart with First lesson, or use a ready-made lesson template.',sections:[{id:'section-first',name:'Section 1',collapsed:false,lessons:[{id:'lesson-first',name:'First lesson',description:'',ready:false,sections:[{id:'part-first',name:'Section 1',exercises:[]}],homework:[],vocabulary:[],notes:''}]}]};}
function exerciseDefaults(type){
  const shared={id:newId(),type,title:EXERCISE_TYPES.find(t=>t.id===type)?.name||'Exercise',body:'',pinyin:'',translation:'',source:'',caption:'',hidden:false,points:1};
  const defaults={
    text:{title:'Read and say hello',body:'你好！我叫小明。\n我是学生。很高兴认识你！',pinyin:'Nǐ hǎo! Wǒ jiào Xiǎo Míng.\nWǒ shì xué sheng. Hěn gāo xìng rèn shi nǐ!',translation:'Hello! My name is Xiao Ming.\nI am a student. Nice to meet you!'},
    article:{title:'Meet Xiao Ming',body:'大家好！我叫小明。我是学生。我喜欢学习中文。你呢？',pinyin:'Dà jiā hǎo! Wǒ jiào Xiǎo Míng. Wǒ shì xué sheng. Wǒ xǐ huan xué xí Zhōng wén. Nǐ ne?',translation:'Hello everyone! My name is Xiao Ming. I am a student. I like learning Chinese. And you?'},
    audio:{title:'Listen to the conversation',source:'',body:'A：你好！你叫什么名字？\nB：我叫小明。你呢？\nA：我叫小红。很高兴认识你！',pinyin:'A: Nǐ hǎo! Nǐ jiào shén me míng zi?\nB: Wǒ jiào Xiǎo Míng. Nǐ ne?\nA: Wǒ jiào Xiǎo Hóng. Hěn gāo xìng rèn shi nǐ!'},
    video:{title:'Watch and discuss',source:'',body:'What Chinese words can you hear?'},
    image:{title:'Look and describe',source:'',caption:'Write a sentence about this picture.'},
    speaking:{title:'Introduce yourself',body:'Say hello, tell us your name, and say where you are from.',pinyin:'Nǐ hǎo! Wǒ jiào… Wǒ lái zì…'},
    gaps:{title:'Fill in the missing words',body:'你[好]！我[叫]小明。\n我[是]学生。',translation:'Hello! My name is Xiao Ming. I am a student.'},
    wordbank:{title:'Choose a word for each gap',body:'我[喜欢]学习中文。\n你[叫]什么名字？\n很[高兴]认识你！',distractors:'谢谢,再见'},
    choicegaps:{title:'Choose the correct word',body:'我[是/叫/好]学生。\n你[叫/是/很]什么名字？\n很[高兴/谢谢/再见]认识你！'},
    labelpicture:{title:'Name the pictures',body:'',hint:'Type a picture URL and its correct label on each line.'},
    quiz:{title:'Choose the correct answer',body:'What does 你好 mean? | Hello | Goodbye | Thank you\nHow do you say “student”? | 学生 | 老师 | 朋友'},
    timedquiz:{title:'Quick Chinese quiz',body:'What does 谢谢 mean? | Thank you | Sorry | Hello\nWhich means “teacher”? | 老师 | 学生 | 朋友',seconds:60},
    truefalse:{title:'True or false?',body:'你好 means “hello”. | true\n谢谢 means “goodbye”. | false\n我是学生 means “I am a student”. | true'},
    matching:{title:'Match the words with their meanings',body:'你好 | hello\n谢谢 | thank you\n再见 | goodbye\n老师 | teacher'},
    order:{title:'Put the words in the correct order',body:'我 / 喜欢 / 学习 / 中文\n你 / 叫 / 什么 / 名字'},
    textorder:{title:'Put the conversation in order',body:'你好！\n你好！你叫什么名字？\n我叫小明。你呢？\n我叫小红。很高兴认识你！'},
    unscramble:{title:'Unscramble the pinyin',body:'nǐhǎo\nxièxie'},
    sorting:{title:'Sort the words into groups',body:'老师 | People\n学生 | People\n水 | Drinks\n茶 | Drinks',categories:'People,Drinks'},
    vocabulary:{title:'New words',body:'你好 | nǐ hǎo | hello\n谢谢 | xiè xie | thank you\n再见 | zài jiàn | goodbye\n老师 | lǎo shī | teacher'},
    flashcards:{title:'Practice the new words',body:'你好 | nǐ hǎo | hello\n谢谢 | xiè xie | thank you\n再见 | zài jiàn | goodbye'},
    characters:{title:'Practice these characters',body:'你好',pinyin:'nǐ hǎo'},
    tones:{title:'Which tone do you see?',body:'mā | 1 | mother\nmá | 2 | hemp\nmǎ | 3 | horse\nmà | 4 | to scold\nma | 5 | question particle'},
    writing:{title:'Write a short introduction',body:'Say hello, write your name, and say that you are a student. Try to write 2–3 sentences in Chinese.',model:'你好！我叫安娜。我是学生。'},
    note:{title:'Remember',body:'In Chinese, the family name usually comes before the given name.\nAsk “你叫什么名字？” to find out someone’s name.'},
    link:{title:'Explore a learning resource',source:'https://www.mdbg.net/chinese/dictionary',body:'Look up new words in the MDBG Chinese dictionary.'},
    embed:{title:'Interactive activity',source:'',body:''},
    divider:{title:'Let’s practice',body:''}
  };
  return Object.assign(shared,defaults[type]||{});
}
const LESSON_TOPICS={
  greetings:{name:'你好 · Hello!',description:'Introductions, greetings & goodbyes',char:'你好',vocab:'你好 | nǐ hǎo | hello\n再见 | zài jiàn | goodbye\n谢谢 | xiè xie | thank you\n名字 | míng zi | name',text:'你好！我叫小明。我是学生。你叫什么名字？',pinyin:'Nǐ hǎo! Wǒ jiào Xiǎo Míng. Wǒ shì xué sheng. Nǐ jiào shén me míng zi?',translation:'Hello! My name is Xiao Ming. I am a student. What is your name?',gaps:'你[好]！我[叫]小明。我[是]学生。',order:'你 / 叫 / 什么 / 名字',quiz:'What does 你好 mean? | Hello | Goodbye | Sorry\nWhich means “name”? | 名字 | 老师 | 学生'},
  numbers:{name:'一二三 · Numbers',description:'Count from one to ten',char:'一二',vocab:'一 | yī | one\n二 | èr | two\n三 | sān | three\n四 | sì | four\n五 | wǔ | five\n六 | liù | six\n七 | qī | seven\n八 | bā | eight\n九 | jiǔ | nine\n十 | shí | ten',text:'一、二、三、四、五。\n六、七、八、九、十。',pinyin:'Yī, èr, sān, sì, wǔ.\nLiù, qī, bā, jiǔ, shí.',translation:'One, two, three, four, five.\nSix, seven, eight, nine, ten.',gaps:'一、[二]、三、[四]、五。\n六、[七]、八、[九]、十。',order:'一 / 二 / 三 / 四 / 五',quiz:'Which character means “three”? | 三 | 四 | 五\nHow do you say “ten”? | 十 | 九 | 七'},
  family:{name:'我的家 · My family',description:'Family members & simple sentences',char:'家人',vocab:'爸爸 | bà ba | dad\n妈妈 | mā ma | mom\n哥哥 | gē ge | older brother\n姐姐 | jiě jie | older sister\n家 | jiā | home',text:'这是我的家。\n这是我爸爸，这是我妈妈。\n我爱我的家！',pinyin:'Zhè shì wǒ de jiā.\nZhè shì wǒ bà ba, zhè shì wǒ mā ma.\nWǒ ài wǒ de jiā!',translation:'This is my family.\nThis is my dad. This is my mom.\nI love my family!',gaps:'这是我[爸爸]，这是我[妈妈]。\n我[爱]我的家！',order:'我 / 爱 / 我的 / 家',quiz:'What does 妈妈 mean? | Mom | Dad | Sister\nWhich means “home”? | 家 | 人 | 我'},
  food:{name:'我喜欢茶 · Food & drinks',description:'Order a drink & talk about food',char:'茶水',vocab:'水 | shuǐ | water\n茶 | chá | tea\n咖啡 | kā fēi | coffee\n米饭 | mǐ fàn | rice\n饺子 | jiǎo zi | dumplings',text:'我喜欢喝茶。\n你喜欢喝什么？\n我喜欢吃饺子。',pinyin:'Wǒ xǐ huan hē chá.\nNǐ xǐ huan hē shén me?\nWǒ xǐ huan chī jiǎo zi.',translation:'I like drinking tea.\nWhat do you like to drink?\nI like eating dumplings.',gaps:'我喜欢[喝]茶。\n我喜欢[吃]饺子。',order:'你 / 喜欢 / 喝 / 什么',quiz:'What does 水 mean? | Water | Tea | Coffee\nWhich verb means “eat”? | 吃 | 喝 | 看'}
};
function createTemplateLesson(key){
  const t=LESSON_TOPICS[key];
  const make=(type,data)=>Object.assign(exerciseDefaults(type),data);
  const exercises=[
    make('text',{title:'Read and say it aloud',body:t.text,pinyin:t.pinyin,translation:t.translation}),
    make('vocabulary',{body:t.vocab}),
    make('audio',{source:key,body:t.text,pinyin:t.pinyin}),
    make('gaps',{body:t.gaps,translation:''}),
    make('matching',{body:t.vocab.split('\n').slice(0,4).map(l=>{const p=l.split('|');return p[0].trim()+' | '+p[2].trim();}).join('\n')}),
    make('order',{body:t.order}),
    make('quiz',{body:t.quiz}),
    make('speaking',{body:'Use the new words to make two sentences. Say them aloud, then record yourself.'})
  ];
  return {id:newId(),name:t.name,description:t.description,ready:false,sections:[{id:newId(),name:'Learn & practice',exercises}],homework:[make('flashcards',{body:t.vocab}),make('writing',{body:'Write three sentences using the words from this lesson.',model:''})],vocabulary:[],notes:''};
}
