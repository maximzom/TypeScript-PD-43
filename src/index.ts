// 1. ОСНОВНІ ТИПИ ДАНИХ.

// Визначаємо дні тижня, коли проходять заняття (тільки робочі дні).
type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

// Визначаємо можливі часові проміжки для занять.
type TimeSlot = 
  | "8:30-10:00" 
  | "10:15-11:45" 
  | "12:15-13:45" 
  | "14:00-15:30" 
  | "15:45-17:15";

// Визначаємо типи навчальних занять.
type CourseType = "Lecture" | "Seminar" | "Lab" | "Practice";

// 2. СТРУКТУРИ ДАНИХ.

// Створюємо тип для викладача з усіма необхідними полями:
type Professor = {
  id: number;              // Унікальний номер викладача.
  name: string;           // ПІБ викладача.
  department: string;     // Кафедра, де працює викладач.
};

// Створюємо тип для навчальної аудиторії:
type Classroom = {
  number: string;         // Номер аудиторії (наприклад, "101").
  capacity: number;       // Місткість аудиторії (кількість студентів).
  hasProjector: boolean;  // Чи є проектор в аудиторії.
};

// Створюємо тип для навчального курсу:
type Course = {
  id: number;            // Унікальний номер курсу.
  name: string;          // Назва курсу.
  type: CourseType;      // Тип заняття (лекція, семінар тощо).
};

// Створюємо тип для окремого заняття в розкладі:
type Lesson = {
  courseId: number;        // ID курсу, який викладається.
  professorId: number;     // ID викладача, який веде заняття.
  classroomNumber: string; // Номер аудиторії, де проходить заняття.
  dayOfWeek: DayOfWeek;    // День тижня заняття.
  timeSlot: TimeSlot;      // Час проведення заняття.
};

// Розширюємо тип заняття додатковим полем lessonId для унікальної ідентифікації.
type ScheduledLesson = Lesson & { lessonId: number };

// Створюємо тип для опису конфлікту в розкладі:
type ScheduleConflict = {
  type: "ProfessorConflict" | "ClassroomConflict";  // Тип конфлікту.
  conflictingLesson: ScheduledLesson;               // Існуюче заняття, що створює конфлікт.
  newLesson: Lesson;                               // Нове заняття, яке намагаємося додати.
};

// 3. ДАНІ СИСТЕМИ

// Створюємо порожні масиви для зберігання всіх даних системи:
const professors: Professor[] = [];      // Масив викладачів.
const classrooms: Classroom[] = [];      // Масив аудиторій.
const courses: Course[] = [];            // Масив курсів.
const schedule: ScheduledLesson[] = [];  // Масив розкладу занять.

// Змінна для відстеження наступного доступного ID заняття
let nextLessonId = 1;

// Константи для розрахунків - всі робочі дні тижня.
const WORK_DAYS: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Константи для розрахунків - всі можливі часові проміжки.
const TIME_SLOTS: TimeSlot[] = [
  "8:30-10:00", "10:15-11:45", "12:15-13:45", 
  "14:00-15:30", "15:45-17:15"
];

// 4. БАЗОВІ ОПЕРАЦІЇ.

/**
 * Додає нового викладача до системи.
 * @param professor - об'єкт викладача для додавання.
 */
function addProfessor(professor: Professor): void {
  // Перевіряємо, чи не існує вже викладач з таким самим ID.
  const existingProfessor = professors.find(p => p.id === professor.id);
  // Якщо викладач з таким ID ще не існує - додаємо його.
  if (!existingProfessor) {
    professors.push(professor);
  }
}

/**
 * Додає нову аудиторію до системи.
 * @param classroom - об'єкт аудиторії для додавання.
 */
function addClassroom(classroom: Classroom): void {
  // Перевіряємо, чи не існує вже аудиторія з таким самим номером.
  const existingClassroom = classrooms.find(c => c.number === classroom.number);
  // Якщо аудиторія з таким номером ще не існує - додаємо її.
  if (!existingClassroom) {
    classrooms.push(classroom);
  }
}

/**
 * Додає новий курс до системи.
 * @param course - об'єкт курсу для додавання.
 */
function addCourse(course: Course): void {
  // Перевіряємо, чи не існує вже курс з таким самим ID.
  const existingCourse = courses.find(c => c.id === course.id);
  // Якщо курс з таким ID ще не існує - додаємо його.
  if (!existingCourse) {
    courses.push(course);
  }
}

// 5. ВАЛІДАЦІЯ ТА КОНФЛІКТИ.

/**
 * Перевіряє, чи нове заняття не конфліктує з існуючим розкладом.
 * @param lesson - заняття для перевірки.
 * @returns інформацію про конфлікт або null, якщо конфліктів немає.
 */
function validateLesson(lesson: Lesson): ScheduleConflict | null {
  // Перебираємо всі заняття в розкладі.
  for (const scheduled of schedule) {
    // Якщо день або час не співпадають - пропускаємо перевірку.
    if (scheduled.dayOfWeek !== lesson.dayOfWeek || scheduled.timeSlot !== lesson.timeSlot) {
      continue;
    }

    // Перевіряємо конфлікт викладача (один викладач не може бути в двох місцях одночасно).
    if (scheduled.professorId === lesson.professorId) {
      return {
        type: "ProfessorConflict",
        conflictingLesson: scheduled,
        newLesson: lesson
      };
    }

    // Перевіряємо конфлікт аудиторії (одна аудиторія не може бути зайнята двома заняттями одночасно).
    if (scheduled.classroomNumber === lesson.classroomNumber) {
      return {
        type: "ClassroomConflict", 
        conflictingLesson: scheduled,
        newLesson: lesson
      };
    }
  }
  // Якщо жодних конфліктів не знайдено - повертаємо null.
  return null;
}

/**
 * Додає нове заняття до розкладу з перевіркою на конфлікти.
 * @param lesson - заняття для додавання.
 * @returns об'єкт з інформацією про результат операції.
 */
function addLesson(lesson: Lesson): { success: boolean; lessonId?: number; conflict?: ScheduleConflict } {
  // Перевіряємо, чи існують всі необхідні сутності в системі.
  const professorExists = professors.some(p => p.id === lesson.professorId);
  const courseExists = courses.some(c => c.id === lesson.courseId);
  const classroomExists = classrooms.some(c => c.number === lesson.classroomNumber);

  // Якщо хоча б одна сутність не існує - повертаємо помилку.
  if (!professorExists || !courseExists || !classroomExists) {
    return { success: false };
  }

  // Перевіряємо наявність конфліктів з існуючим розкладом.
  const conflict = validateLesson(lesson);
  if (conflict) {
    return { success: false, conflict };
  }

  // Створюємо нове заняття з унікальним ID.
  const scheduledLesson: ScheduledLesson = {
    ...lesson,           // Копіюємо всі поля з оригінального заняття.
    lessonId: nextLessonId++  // Додаємо унікальний ID та збільшуємо лічильник.
  };

  // Додаємо заняття до розкладу.
  schedule.push(scheduledLesson);
  // Повертаємо успішний результат з ID створеного заняття.
  return { success: true, lessonId: scheduledLesson.lessonId };
}

// 6. ПОШУК ТА ФІЛЬТРАЦІЯ.

/**
 * Знаходить вільні аудиторії для вказаного часу та дня.
 * @param timeSlot - часовий проміжок.
 * @param dayOfWeek - день тижня.
 * @returns масив вільних аудиторій.
 */
function findAvailableClassrooms(timeSlot: TimeSlot, dayOfWeek: DayOfWeek): Classroom[] {
  // Створюємо Set з номерами зайнятих аудиторій у вказаний час.
  const occupiedClassrooms = new Set(
    schedule
      .filter(lesson => lesson.dayOfWeek === dayOfWeek && lesson.timeSlot === timeSlot)
      .map(lesson => lesson.classroomNumber)
  );

  // Фільтруємо всі аудиторії, залишаючи тільки ті, які не зайняті.
  return classrooms.filter(classroom => !occupiedClassrooms.has(classroom.number));
}

/**
 * Отримує розклад конкретного викладача.
 * @param professorId - ID викладача.
 * @returns масив занять викладача.
 */
function getProfessorSchedule(professorId: number): ScheduledLesson[] {
  // Фільтруємо розклад, залишаючи тільки заняття вказаного викладача.
  return schedule.filter(lesson => lesson.professorId === professorId);
}

/**
 * Отримує розклад конкретної аудиторії.
 * @param classroomNumber - номер аудиторії.
 * @returns масив залень в аудиторії.
 */
function getClassroomSchedule(classroomNumber: string): ScheduledLesson[] {
  // Фільтруємо розклад, залишаючи тільки заняття в указаній аудиторії.
  return schedule.filter(lesson => lesson.classroomNumber === classroomNumber);
}

// 7. АНАЛІТИКА ТА ЗВІТИ.

/**
 * Розраховує відсоток використання аудиторії.
 * @param classroomNumber - номер аудиторії.
 * @returns відсоток використання (0-100).
 */
function getClassroomUtilization(classroomNumber: string): number {
  // Загальна кількість можливих занять (5 днів * 5 проміжків).
  const totalSlots = WORK_DAYS.length * TIME_SLOTS.length;
  // Кількість фактично використаних занять в аудиторії.
  const usedSlots = schedule.filter(lesson => 
    lesson.classroomNumber === classroomNumber
  ).length;
  
  // Розраховуємо відсоток використання та округлюємо до 2 знаків після коми.
  return Number(((usedSlots / totalSlots) * 100).toFixed(2));
}

/**
 * Визначає найпопулярніший тип занять
 * @returns тип найпопулярнішого заняття
 */
function getMostPopularCourseType(): CourseType {
  // Створюємо Map для підрахунку кількості залень кожного типу.
  const typeCounts = new Map<CourseType, number>();
  
  // Перебираємо всі заняття в розкладі.
  schedule.forEach(lesson => {
    // Знаходимо курс, до якого належить заняття.
    const course = courses.find(c => c.id === lesson.courseId);
    if (course) {
      // Збільшуємо лічильник для типу курсу.
      typeCounts.set(course.type, (typeCounts.get(course.type) || 0) + 1);
    }
  });

  // Встановлюємо початкові значення для пошуку максимуму.
  let mostPopular: CourseType = "Lecture";
  let maxCount = 0;

  // Шукаємо тип з найбільшою кількістю занять.
  typeCounts.forEach((count, type) => {
    if (count > maxCount) {
      maxCount = count;
      mostPopular = type;
    }
  });

  return mostPopular;
}

/**
 * Знаходить найзавантаженіших викладачів.
 * @returns масив викладачів, відсортований за завантаженістю.
 */
function getBusiestProfessors(): Professor[] {
  // Створюємо Map для підрахунку кількості залень у кожного викладача.
  const professorWorkload = new Map<number, number>();
  
  // Перебираємо всі заняття та рахуємо кількість для кожного викладача.
  schedule.forEach(lesson => {
    professorWorkload.set(lesson.professorId, (professorWorkload.get(lesson.professorId) || 0) + 1);
  });

  // Перетворюємо Map в масив, сортуємо за спаданням навантаження.
  return Array.from(professorWorkload.entries())
    .sort(([,a], [,b]) => b - a)  // Сортуємо за кількістю залень (спадання).
    .map(([professorId]) => professors.find(p => p.id === professorId)) // Знаходимо об'єкти викладачів.
    .filter((p): p is Professor => p !== undefined)  // Фільтруємо undefined значення.
    .slice(0, 5);  // Беремо топ-5 найзавантаженіших.
}

// 8. МОДИФІКАЦІЯ РОЗКЛАДУ.

/**
 * Змінює аудиторію для існуючого заняття.
 * @param lessonId - ID заняття.
 * @param newClassroomNumber - новий номер аудиторії.
 * @returns true, якщо зміна успішна, false - якщо ні.
 */
function reassignClassroom(lessonId: number, newClassroomNumber: string): boolean {
  // Знаходимо індекс заняття в масиві розкладу.
  const lessonIndex = schedule.findIndex(lesson => lesson.lessonId === lessonId);
  // Якщо заняття не знайдено - повертаємо false.
  if (lessonIndex === -1) return false;

  // Отримуємо об'єкт заняття.
  const lesson = schedule[lessonIndex];
  // Перевіряємо, чи існує нова аудиторія.
  const classroomExists = classrooms.some(c => c.number === newClassroomNumber);
  if (!classroomExists) return false;

  // Перевіряємо, чи нова аудиторія вільна в потрібний час.
  const hasConflict = schedule.some(scheduled => 
    scheduled.lessonId !== lessonId &&  // Не перевіряємо поточне заняття.
    scheduled.classroomNumber === newClassroomNumber &&  // Та сама аудиторія.
    scheduled.dayOfWeek === lesson.dayOfWeek &&  // Той самий день.
    scheduled.timeSlot === lesson.timeSlot        // Той самий час.
  );

  // Якщо є конфлікт - повертаємо false.
  if (hasConflict) return false;

  // Оновлюємо номер аудиторії для заняття.
  schedule[lessonIndex] = { ...lesson, classroomNumber: newClassroomNumber };
  return true;
}

/**
 * Видаляє заняття з розкладу.
 * @param lessonId - ID заняття для видалення.
 * @returns true, якщо видалення успішне, false - якщо ні.
 */
function cancelLesson(lessonId: number): boolean {
  // Знаходимо індекс заняття в масиві розкладу.
  const lessonIndex = schedule.findIndex(lesson => lesson.lessonId === lessonId);
  // Якщо заняття не знайдено - повертаємо false.
  if (lessonIndex === -1) return false;

  // Видаляємо заняття з масиву за допомогою splice.
  schedule.splice(lessonIndex, 1);
  return true;
}

/**
 * Переносить заняття на інший день та час.
 * @param lessonId - ID заняття.
 * @param newDay - новий день тижня.
 * @param newTime - новий часовий проміжок.
 * @returns true, якщо перенесення успішне, false - якщо ні.
 */
function rescheduleLesson(lessonId: number, newDay: DayOfWeek, newTime: TimeSlot): boolean {
  // Знаходимо індекс заняття в масиві розкладу.
  const lessonIndex = schedule.findIndex(lesson => lesson.lessonId === lessonId);
  // Якщо заняття не знайдено - повертаємо false.
  if (lessonIndex === -1) return false;

  // Отримуємо об'єкт заняття.
  const lesson = schedule[lessonIndex];
  // Створюємо копію заняття з новим днем та часом.
  const rescheduledLesson: Lesson = {
    ...lesson,
    dayOfWeek: newDay,
    timeSlot: newTime
  };

  // Перевіряємо, чи новий час не конфліктує з існуючим розкладом.
  const conflict = validateLesson(rescheduledLesson);
  if (conflict) return false;

  // Оновлюємо заняття в розкладі.
  schedule[lessonIndex] = { ...rescheduledLesson, lessonId };
  return true;
}

// 9. ДОДАТКОВІ ФУНКЦІЇ.

/**
 * Знаходить вільні часові проміжки для викладача або аудиторії.
 * @param professorId - ID викладача.
 * @param classroomNumber - номер аудиторії.
 * @returns масив вільних днів та часових проміжків.
 */
function findAvailableTimeSlots(professorId?: number, classroomNumber?: string): 
  { day: DayOfWeek; slot: TimeSlot }[] {
  
  // Створюємо масив для зберігання вільних проміжків.
  const availableSlots: { day: DayOfWeek; slot: TimeSlot }[] = [];

  // Перебираємо всі дні тижня.
  WORK_DAYS.forEach(day => {
    // Перебираємо всі часові проміжки.
    TIME_SLOTS.forEach(slot => {
      // Перевіряємо, чи є конфлікт для поточного дня та часу.
      const hasConflict = schedule.some(lesson => {
        // Якщо день або час не співпадають - конфлікту немає.
        if (lesson.dayOfWeek !== day || lesson.timeSlot !== slot) return false;
        // Перевіряємо конфлікт для викладача.
        if (professorId && lesson.professorId === professorId) return true;
        // Перевіряємо конфлікт для аудиторії.
        if (classroomNumber && lesson.classroomNumber === classroomNumber) return true;
        return false;
      });

      // Якщо конфліктів немає - додаємо проміжок до вільних.
      if (!hasConflict) {
        availableSlots.push({ day, slot });
      }
    });
  });

  return availableSlots;
}

/**
 * Генерує статистику по системі.
 * @returns об'єкт зі статистикою.
 */
function getScheduleStatistics() {
  return {
    totalLessons: schedule.length,  // Загальна кількість занять.
    totalProfessors: professors.length,  // Кількість викладачів.
    totalClassrooms: classrooms.length,  // Кількість аудиторій.
    totalCourses: courses.length,  // Кількість курсів.
    // Загальний рівень використання ресурсів.
    utilizationRate: Number((
      schedule.length / (WORK_DAYS.length * TIME_SLOTS.length * classrooms.length) * 100
    ).toFixed(2)),
    mostPopularCourseType: getMostPopularCourseType(),  // Найпопулярніший тип занять.
    busiestProfessors: getBusiestProfessors().map(p => p.name)  // Імена найзавантаженіших викладачів.
  };
}

// 10. ДЕМОНСТРАЦІЯ РОБОТИ.

/**
 * Ініціалізує тестові дані для демонстрації роботи системи.
 */
function initializeDemoData(): void {
  // Додаємо тестових викладачів.
  addProfessor({ id: 1, name: "Доктор Сміт", department: "Комп'ютерні науки" });
  addProfessor({ id: 2, name: "Професор Джонсон", department: "Математика" });
  addProfessor({ id: 3, name: "Доктор Браун", department: "Фізика" });

  // Додаємо тестові аудиторії.
  addClassroom({ number: "A101", capacity: 30, hasProjector: true });
  addClassroom({ number: "B202", capacity: 25, hasProjector: false });
  addClassroom({ number: "C303", capacity: 50, hasProjector: true });

  // Додаємо тестові курси.
  addCourse({ id: 101, name: "Алгоритми", type: "Lecture" });
  addCourse({ id: 102, name: "Математичний аналіз", type: "Practice" });
  addCourse({ id: 103, name: "Квантова фізика", type: "Lab" });
}

/**
 * Запускає демонстрацію роботи системи.
 */
function runDemo(): void {
  // Ініціалізуємо тестові дані.
  initializeDemoData();

  console.log("=== ТЕСТУВАННЯ СИСТЕМИ УПРАВЛІННЯ РОЗКЛАДОМ ===");
  console.log("");

  // Тест 1: Додавання заняття.
  const lesson1: Lesson = {
    courseId: 101,
    professorId: 1,
    classroomNumber: "A101",
    dayOfWeek: "Monday",
    timeSlot: "8:30-10:00"
  };

  const result1 = addLesson(lesson1);
  console.log("Додавання заняття 1:", result1.success ? "Успішно." : "Помилка.");

  // Тест 2: Спроба додати заняття з конфліктом аудиторії.
  const lesson2: Lesson = {
    courseId: 102,
    professorId: 2,
    classroomNumber: "A101", // Та сама аудиторія.
    dayOfWeek: "Monday",
    timeSlot: "8:30-10:00"  // Той самий час.
  };

  const result2 = addLesson(lesson2);
  console.log("Додавання заняття 2 (конфлікт):", 
    result2.success ? "Успішно." : `Помилка - ${result2.conflict?.type}.`);

  // Тест 3: Успішне додавання заняття без конфліктів.
  const lesson3: Lesson = {
    courseId: 103,
    professorId: 3,
    classroomNumber: "B202",
    dayOfWeek: "Tuesday", 
    timeSlot: "10:15-11:45"
  };

  const result3 = addLesson(lesson3);
  console.log("Додавання заняття 3:", result3.success ? "Успішно." : "Помилка.");

  // Тест 4: Пошук вільних аудиторій.
  const available = findAvailableClassrooms("8:30-10:00", "Monday");
  console.log("Вільні аудиторії в понеділок о 8:30-10:00:", 
    available.map(room => room.number) + ".");

  // Тест 5: Отримання статистики системи.
  const stats = getScheduleStatistics();
  console.log("");
  console.log("Статистика системи:", stats);
  console.log("");

  // Тест 6: Вивід завантаженості аудиторій.
  console.log("Завантаженість аудиторій:");
  classrooms.forEach(room => {
    const utilization = getClassroomUtilization(room.number);
    console.log(`Аудиторія ${room.number}: ${utilization}%.`);
  });
}

// Запускаємо демонстрацію роботи системи.
runDemo();