import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const challenges = [
    {
      date: new Date('2026-02-21T00:00:00Z'),
      language: 'python',
      bugType: 'LOGICAL',
      difficulty: 'EASY',
      context: 'Part of a student grade calculator for a university portal',
      expectedOutput: '80.0\n',
      hint1: 'The function returns a number, but it might not be the right one',
      hint2: 'Look carefully at the return statement',
      hint3: 'Remove the + 1 from the return line',
      correctCode: `def get_average(grades):\n    total = 0\n    for grade in grades:\n        total += grade\n    return total / len(grades)\n\nprint(get_average([80, 90, 70]))`,
      buggyCode: `def get_average(grades):\n    total = 0\n    for grade in grades:\n        total += grade\n    return total / len(grades) + 1\n\nprint(get_average([80, 90, 70]))`,
    },
    {
      date: new Date('2026-02-22T00:00:00Z'),
      language: 'javascript',
      bugType: 'SYNTAX',
      difficulty: 'EASY',
      context: 'Part of a to-do app built for a web development assignment',
      expectedOutput: 'true\n',
      hint1: 'The error is about an unclosed expression',
      hint2: 'Count the opening and closing brackets/parentheses in the map call',
      hint3: 'Add a ) after the closing } of the map callback, before the final }',
      correctCode: `function markComplete(tasks, id) {\n    return tasks.map(task => {\n        if (task.id === id) {\n            return { ...task, done: true }\n        }\n        return task\n    })\n}\n\nconst tasks = [{ id: 1, done: false }, { id: 2, done: false }]\nconsole.log(markComplete(tasks, 1)[0].done)`,
      buggyCode: `function markComplete(tasks, id) {\n    return tasks.map(task => {\n        if (task.id === id) {\n            return { ...task, done: true }\n        }\n        return task\n    }\n}\n\nconst tasks = [{ id: 1, done: false }, { id: 2, done: false }]\nconsole.log(markComplete(tasks, 1)[0].done)`,
    },
    {
      date: new Date('2026-02-23T00:00:00Z'),
      language: 'python',
      bugType: 'EDGE_CASE',
      difficulty: 'MEDIUM',
      context: 'A search function inside a student library management system',
      expectedOutput: 'Harry Potter\n',
      hint1: 'The function finds some books but not others — think about why',
      hint2: 'What if the user types the title in lowercase?',
      hint3: 'Use .lower() on both sides of the comparison',
      correctCode: `def find_book(library, title):\n    for book in library:\n        if book['title'].lower() == title.lower():\n            return book\n    return None\n\nlibrary = [{'title': 'Harry Potter', 'author': 'Rowling'}]\nresult = find_book(library, 'harry potter')\nprint(result['title'] if result else 'Not found')`,
      buggyCode: `def find_book(library, title):\n    for book in library:\n        if book['title'] == title:\n            return book\n    return None\n\nlibrary = [{'title': 'Harry Potter', 'author': 'Rowling'}]\nresult = find_book(library, 'harry potter')\nprint(result['title'] if result else 'Not found')`,
    },
    {
      date: new Date('2026-02-24T00:00:00Z'),
      language: 'javascript',
      bugType: 'LOGICAL',
      difficulty: 'MEDIUM',
      context: 'Auth helper inside a student login system for a campus app',
      expectedOutput: 'false\n',
      hint1: 'The function returns true for passwords that should be rejected',
      hint2: 'Think about whether ALL conditions should be true, or just ONE',
      hint3: 'Change || to && so all three conditions must be met',
      correctCode: `function isPasswordValid(password) {\n    const hasUpper  = /[A-Z]/.test(password)\n    const hasNumber = /[0-9]/.test(password)\n    const isLong    = password.length > 8\n    return hasUpper && hasNumber && isLong\n}\n\nconsole.log(isPasswordValid('weakpass'))`,
      buggyCode: `function isPasswordValid(password) {\n    const hasUpper  = /[A-Z]/.test(password)\n    const hasNumber = /[0-9]/.test(password)\n    const isLong    = password.length > 8\n    return hasUpper || hasNumber || isLong\n}\n\nconsole.log(isPasswordValid('weakpass'))`,
    },
    {
      date: new Date('2026-02-25T00:00:00Z'),
      language: 'python',
      bugType: 'REAL_WORLD',
      difficulty: 'HARD',
      context: 'A file parser in a student data pipeline for processing CSV exports',
      expectedOutput: '92\n',
      hint1: 'The bug relates to whitespace in the CSV data',
      hint2: 'The value after the comma has a leading space — int() cannot parse " 92"',
      hint3: 'Add .strip() after splitting on the score variable',
      correctCode: `def parse_scores(data):\n    lines = data.strip().split('\\n')\n    scores = []\n    for line in lines[1:]:\n        name, score = line.split(',')\n        scores.append({'name': name, 'score': int(score.strip())})\n    return scores\n\ncsv = 'name,score\\nAlice, 92\\nBob, 85'\nprint(parse_scores(csv)[0]['score'])`,
      buggyCode: `def parse_scores(data):\n    lines = data.strip().split('\\n')\n    scores = []\n    for line in lines[1:]:  # skip header\n        name, score = line.split(',')\n        scores.append({'name': name, 'score': int(score)})\n    return scores\n\ncsv = 'name,score\\nAlice, 92\\nBob, 85'\nprint(parse_scores(csv)[0]['score'])`,
    },
    {
      date: new Date('2026-02-26T00:00:00Z'),
      language: 'javascript',
      bugType: 'LOGICAL',
      difficulty: 'EASY',
      context: 'Simple counter increment',
      expectedOutput: '1',
      hint1: 'postfix vs prefix increment',
      hint2: 'x++ evaluates to x, then increments. ++x increments, then evaluates.',
      hint3: 'Use ++x instead of x++',
      correctCode: `let x = 0;\nconsole.log(++x);`,
      buggyCode: `let x = 0;\nconsole.log(x++);`,
    },
    {
      date: new Date('2026-02-27T00:00:00Z'),
      language: 'python',
      bugType: 'SYNTAX',
      difficulty: 'EASY',
      context: 'Checking if a number is even',
      expectedOutput: 'True',
      hint1: 'assignment vs equality operator',
      hint2: '= is used to assign values, not to compare them.',
      hint3: 'Use == to check for equality.',
      correctCode: `def is_even(n):\n    return n % 2 == 0\n\nprint(is_even(4))`,
      buggyCode: `def is_even(n):\n    return n % 2 = 0\n\nprint(is_even(4))`,
    },
    {
      date: new Date('2026-02-28T00:00:00Z'),
      language: 'javascript',
      bugType: 'TYPE_ERROR',
      difficulty: 'MEDIUM',
      context: 'Adding numbers from string inputs',
      expectedOutput: '5',
      hint1: 'string concatenation vs numeric addition',
      hint2: 'The inputs are strings, so + is concatenating them instead of adding.',
      hint3: 'Wrap a and b in Number() or parseInt().',
      correctCode: `function add(a, b) {\n    return Number(a) + Number(b);\n}\nconsole.log(add('2', '3'));`,
      buggyCode: `function add(a, b) {\n    return a + b;\n}\nconsole.log(add('2', '3'));`,
    },
    {
      date: new Date('2026-03-01T00:00:00Z'),
      language: 'python',
      bugType: 'LOGICAL',
      difficulty: 'MEDIUM',
      context: 'Missing return statement',
      expectedOutput: '25',
      hint1: 'What does the function actually evaluate to?',
      hint2: 'Functions return None by default if there is no return statement.',
      hint3: 'Add a return keyword before x * x',
      correctCode: `def square(x):\n    return x * x\nprint(square(5))`,
      buggyCode: `def square(x):\n    x * x\nprint(square(5))`,
    },
    {
      date: new Date('2026-03-02T00:00:00Z'),
      language: 'javascript',
      bugType: 'LOGICAL',
      difficulty: 'MEDIUM',
      context: 'Array filtering syntax',
      expectedOutput: '2',
      hint1: 'Arrow function implicit return',
      hint2: 'When using curly braces in an arrow function, you must explicitly use the return keyword.',
      hint3: 'Either remove the curly braces or add a return statement inside them.',
      correctCode: `const evens = [1, 2, 3].filter(x => x % 2 === 0);\nconsole.log(evens[0]);`,
      buggyCode: `const evens = [1, 2, 3].filter(x => { x % 2 === 0 });\nconsole.log(evens[0]);`,
    },
    {
      date: new Date('2026-03-03T00:00:00Z'),
      language: 'python',
      bugType: 'LOGICAL',
      difficulty: 'EASY',
      context: 'String reversal using slicing',
      expectedOutput: 'olleh',
      hint1: 'List slicing syntax is [start:stop:step]',
      hint2: 'By specifying 0 as the start, you are only reversing from index 0.',
      hint3: 'Omit the 0 to reverse the entire string.',
      correctCode: `print("hello"[::-1])`,
      buggyCode: `print("hello"[0::-1])`,
    },
    {
      date: new Date('2026-03-04T00:00:00Z'),
      language: 'javascript',
      bugType: 'SYNTAX',
      difficulty: 'EASY',
      context: 'Object destructuring initialization',
      expectedOutput: 'Alice',
      hint1: 'Look at how the destructured variable is initialized.',
      hint2: 'You must use = for assignment.',
      hint3: 'Change the == to =.',
      correctCode: `const { name } = { name: "Alice" };\nconsole.log(name);`,
      buggyCode: `const { name } == { name: "Alice" };\nconsole.log(name);`,
    },
    {
      date: new Date('2026-03-05T00:00:00Z'),
      language: 'python',
      bugType: 'TYPE_ERROR',
      difficulty: 'EASY',
      context: 'List concatenation',
      expectedOutput: '[1, 2]',
      hint1: 'You can only concatenate a list to another list.',
      hint2: 'The integer 2 needs to be inside a list.',
      hint3: 'Wrap the 2 in brackets: [2]',
      correctCode: `print([1] + [2])`,
      buggyCode: `print([1] + 2)`,
    },
    {
      date: new Date('2026-03-06T00:00:00Z'),
      language: 'javascript',
      bugType: 'EDGE_CASE',
      difficulty: 'HARD',
      context: 'Finding maximum in an array',
      expectedOutput: '3',
      hint1: 'Math.max does not accept an array directly.',
      hint2: 'You need to spread the array elements into individual arguments.',
      hint3: 'Use the spread operator (...) before the array.',
      correctCode: `console.log(Math.max(...[1, 2, 3]));`,
      buggyCode: `console.log(Math.max([1, 2, 3]));`,
    },
    {
      date: new Date('2026-03-07T00:00:00Z'),
      language: 'python',
      bugType: 'LOGICAL',
      difficulty: 'MEDIUM',
      context: 'Dictionary get with default value',
      expectedOutput: '1',
      hint1: 'KeyError occurs when accessing a non-existent key directly.',
      hint2: 'Use the dictionary .get() method to provide a default value.',
      hint3: "Change d['a'] to d.get('a', 1).",
      correctCode: `d = {}\nprint(d.get('a', 1))`,
      buggyCode: `d = {}\nprint(d['a'])`,
    },
  ]

  for (const challenge of challenges) {
    await prisma.dailyChallenge.upsert({
      where: {
        date_language: {
          date: challenge.date,
          language: challenge.language,
        }
      },
      update: {},
      create: challenge,
    })
  }

  // Seed Practice Challenges
  const practiceLanguages = ['python', 'javascript', 'cpp', 'java', 'c', 'go'];
  const practiceDifficulties = ['EASY', 'MEDIUM', 'HARD'];

  const practiceChallenges = Array.from({ length: 150 }).map((_, i) => {
    const lang = practiceLanguages[i % practiceLanguages.length];
    const diff = practiceDifficulties[i % practiceDifficulties.length];

    return {
      language: lang,
      bugType: ['SYNTAX', 'LOGICAL', 'EDGE_CASE', 'TYPE_ERROR', 'PERFORMANCE'][i % 5],
      difficulty: diff,
      context: `${diff} Practice Challenge in ${lang} #${i + 1}`,
      expectedOutput: `success-${lang}-${i}`,
      hint1: 'Check the syntax basics.',
      hint2: 'Review the logic flow.',
      hint3: 'Fix the obvious error.',
      correctCode: `// correct code for ${lang} ${diff}`,
      buggyCode: `// buggy code for ${lang} ${diff}`,
    };
  });

  // clear old practice challenges
  await prisma.practiceChallenge.deleteMany({});

  await prisma.practiceChallenge.createMany({
    data: practiceChallenges
  });
  console.log('Seeded practice challenges');

  // Seed Debug Rooms
  const demoUser = await prisma.user.findUnique({ where: { email: 'demo@example.com' } });
  if (demoUser) {
    const rooms = [
      {
        title: "React useEffect infinite loop",
        language: "javascript",
        difficulty: "MEDIUM",
        summary: "I'm fetching data inside useEffect and it keeps resetting the state, causing a loop.",
        buggyCode: "useEffect(() => {\n  fetchData().then(data => setData(data));\n}, [data]);",
        creatorId: demoUser.id,
        status: "open"
      },
      {
        title: "Python list index out of range",
        language: "python",
        difficulty: "EASY",
        summary: "Getting index error in a simple loop.",
        buggyCode: "items = [1, 2, 3]\nfor i in range(len(items) + 1):\n    print(items[i])",
        creatorId: demoUser.id,
        status: "solved"
      }
    ];

    for (const roomData of rooms) {
      const room = await prisma.debugRoom.create({
        data: roomData
      });

      if (roomData.status === 'solved') {
        await prisma.suggestedFix.create({
          data: {
            roomId: room.id,
            userId: demoUser.id,
            fixedCode: "items = [1, 2, 3]\nfor i in range(len(items)):\n    print(items[i])",
            explanation: "The range stop should be len(items), not len(items) + 1.",
            isAccepted: true
          }
        });
      }
    }
    console.log('Seeded debug rooms');
  }
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
