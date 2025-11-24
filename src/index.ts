// - ВИЗНАЧЕННЯ ПЕРЕЛІЧЕНЬ (ENUM).

/**
 * Перелік можливих статусів студента в університеті:
 * - Active - студент активно навчається.
 * - Academic_Leave - студент у академічній відпустці  .
 * - Graduated - студент успішно закінчив навчання.
 * - Expelled - студента відраховано з університету.
 */
enum StudentStatus {
  Active = 'Active',
  Academic_Leave = 'Academic_Leave',
  Graduated = 'Graduated',
  Expelled = 'Expelled'
}

/**
 * Перелік типів навчальних курсів:
 * - Mandatory - обов'язковий курс для вивчення.
 * - Optional - курс за вибором студента.
 * - Special - спеціальний курс.
 */
enum CourseType {
  Mandatory = 'Mandatory',
  Optional = 'Optional', 
  Special = 'Special'
}

/**
 * Перелік навчальних семестрів:
 * - First - перший семестр навчального року.
 * - Second - другий семестр навчального року.
 */
enum Semester {
  First = 'First',
  Second = 'Second'
}

/**
 * Система оцінювання знань студентів:
 * - Excellent - відмінно (5 балів).
 * - Good - добре (4 бали).
 * - Satisfactory - задовільно (3 бали). 
 * - Unsatisfactory - незадовільно (2 бали).
 */
enum GradeValue {
  Excellent = 5,
  Good = 4,
  Satisfactory = 3,
  Unsatisfactory = 2
}

/**
 * Перелік факультетів університету:
 * - Computer_Science - факультет комп'ютерних наук.
 * - Economics - економічний факультет.
 * - Law - юридичний факультет
 * - Engineering - інженерний факультет
 */
enum Faculty {
  Computer_Science = 'Computer_Science',
  Economics = 'Economics',
  Law = 'Law',
  Engineering = 'Engineering'
}

// - ВИЗНАЧЕННЯ ІНТЕРФЕЙСІВ ДАНИХ.

/**
 * Інтерфейс для зберігання інформації про студента:
 * - id - унікальний ідентифікатор студента.
 * - fullName - повне ім'я студента.
 * - faculty - факультет, на якому навчається студент.
 * - year - рік навчання студента.
 * - status - поточний статус студента.
 * - enrollmentDate - дата зарахування до університету.
 * - groupNumber - номер навчальної групи студента.
 */
interface Student {
  id: number;
  fullName: string;
  faculty: Faculty;
  year: number;
  status: StudentStatus;
  enrollmentDate: Date;
  groupNumber: string;
}

/**
 * Інтерфейс для зберігання інформації про навчальний курс:
 * - id - унікальний ідентифікатор курсу.
 * - name - назва навчального курсу.
 * - type - тип курсу (обов'язковий, вибірковий, спеціальний).
 * - credits - кількість кредитів за курс.
 * - semester - семестр, в якому викладається курс.
 * - faculty - факультет, для якого призначений курс.
 * - maxStudents - максимальна кількість студентів на курсі.
 * - enrolledStudents - поточна кількість записаних студентів.
 */
interface Course {
  id: number;
  name: string;
  type: CourseType;
  credits: number;
  semester: Semester;
  faculty: Faculty;
  maxStudents: number;
  enrolledStudents: number;
}

/**
 * Інтерфейс для зберігання інформації про оцінку студента:
 * - studentId - ідентифікатор студента, якому виставлено оцінку.
 * - courseId - ідентифікатор курсу, за який виставлено оцінку.
 * - grade - отримана оцінка.
 * - date - дата виставлення оцінки.
 * - semester - семестр, в якому отримано оцінку.
 */
interface GradeRecord {
  studentId: number;
  courseId: number;
  grade: GradeValue;
  date: Date;
  semester: Semester;
}

// - ОСНОВНИЙ КЛАС СИСТЕМИ УПРАВЛІННЯ.

/**
 * Головний клас системи управління університетом.
 * Відповідає за всі операції зі студентами, курсами та оцінками.
 */
class UniversityManagementSystem {
  // Масив для зберігання всіх студентів університету.
  private students: Student[] = [];
  
  // Масив для зберігання всіх навчальних курсів.
  private courses: Course[] = [];
  
  // Масив для зберігання всіх оцінок студентів.
  private grades: GradeRecord[] = [];
  
  // Масив для відстеження реєстрацій студентів на курси.
  private registrations: { studentId: number; courseId: number }[] = [];
  
  // Лічильник для генерації унікальних ідентифікаторів студентів.
  private nextStudentId: number = 1;
  
  // Лічильник для генерації унікальних ідентифікаторів курсів.
  private nextCourseId: number = 1;

  /**
   * Метод для зарахування нового студента до університету.
   * Приймає дані студента без ідентифікатора.
   * Повертає об'єкт студента з присвоєним ідентифікатором.
   */
  enrollStudent(studentData: Omit<Student, "id">): Student {
    // Створюємо нового студента з унікальним ідентифікатором.
    const newStudent: Student = {
      id: this.nextStudentId++,  // Присвоюємо ідентифікатор та збільшуємо лічильник.
      ...studentData             // Копіюємо всі передані дані студента.
    };
    
    // Додаємо нового студента до загального списку.
    this.students.push(newStudent);
    
    // Виводимо повідомлення про успішне зарахування.
    console.log(`Студента ${studentData.fullName} зараховано на факультет ${studentData.faculty}.`);
    
    // Повертаємо створений об'єкт студента.
    return newStudent;
  }

  /**
   * Метод для реєстрації студента на навчальний курс.
   * Перевіряє можливість реєстрації перед додаванням.
   */
  registerForCourse(studentId: number, courseId: number): void {
    // Шукаємо студента за ідентифікатором.
    const student = this.students.find(s => s.id === studentId);
    
    // Шукаємо курс за ідентифікатором.
    const course = this.courses.find(c => c.id === courseId);

    // Перевіряємо, чи існують студент та курс.
    if (!student) {
      throw new Error(`Студента з ідентифікатором ${studentId} не знайдено.`);
    }
    if (!course) {
      throw new Error(`Курс з ідентифікатором ${courseId} не знайдено.`);
    }

    // Перевіряємо, чи студент має активний статус.
    if (student.status !== StudentStatus.Active) {
      throw new Error(`Студент ${student.fullName} не може реєструватися на курси через статус: ${student.status}.`);
    }

    // Перевіряємо відповідність факультету студента та курсу.
    if (student.faculty !== course.faculty) {
      throw new Error(`Студент факультету ${student.faculty} не може реєструватися на курс факультету ${course.faculty}.`);
    }

    // Перевіряємо наявність вільних місць на курсі.
    if (course.enrolledStudents >= course.maxStudents) {
      throw new Error(`Курс "${course.name}" вже заповнений. Максимальна кількість: ${course.maxStudents}.`);
    }

    // Перевіряємо, чи студент вже зареєстрований на цей курс.
    const existingRegistration = this.registrations.find(
      r => r.studentId === studentId && r.courseId === courseId
    );
    if (existingRegistration) {
      throw new Error(`Студент вже зареєстрований на курс "${course.name}".`);
    }

    // Додаємо запис про реєстрацію.
    this.registrations.push({ studentId, courseId });
    
    // Збільшуємо лічильник зареєстрованих студентів на курсі.
    course.enrolledStudents++;
    
    // Виводимо повідомлення про успішну реєстрацію
    console.log(`Студента ${student.fullName} зареєстровано на курс "${course.name}".`);
  }

  /**
   * Метод для виставлення оцінки студенту за курс.
   * Перевіряє, чи студент зареєстрований на курс перед виставленням оцінки.
   */
  setGrade(studentId: number, courseId: number, grade: GradeValue): void {
    // Знаходимо студента за ідентифікатором.
    const student = this.students.find(s => s.id === studentId);
    
    // Знаходимо курс за ідентифікатором.
    const course = this.courses.find(c => c.id === courseId);

    // Перевіряємо існування студента та курсу.
    if (!student) {
      throw new Error(`Студента з ідентифікатором ${studentId} не знайдено.`);
    }
    if (!course) {
      throw new Error(`Курс з ідентифікатором ${courseId} не знайдено.`);
    }

    // Перевіряємо, чи студент зареєстрований на курс.
    const isRegistered = this.registrations.some(
      r => r.studentId === studentId && r.courseId === courseId
    );
    if (!isRegistered) {
      throw new Error(`Студент ${student.fullName} не зареєстрований на курс "${course.name}".`);
    }

    // Шукаємо існуючу оцінку студента за цей курс.
    const existingGrade = this.grades.find(
      g => g.studentId === studentId && g.courseId === courseId
    );

    // Якщо оцінка вже існує - оновлюємо її.
    if (existingGrade) {
      existingGrade.grade = grade;           // Оновлюємо значення оцінки.
      existingGrade.date = new Date();       // Оновлюємо дату виставлення оцінки.
    } else {
      // Якщо оцінки немає - створюємо новий запис.
      this.grades.push({
        studentId,
        courseId,
        grade,
        date: new Date(),                    // Встановлюємо поточну дату.
        semester: course.semester            // Копіюємо семестр з курсу.
      });
    }

    // Виводимо повідомлення про успішне виставлення оцінки.
    console.log(`Студенту ${student.fullName} виставлено оцінку ${grade} за курс "${course.name}".`);
  }

  /**
   * Метод для оновлення статусу студента.
   * Виконує валідацію зміни статусу відповідно до правил університету.
   */
  updateStudentStatus(studentId: number, newStatus: StudentStatus): void {
    // Знаходимо студента за ідентифікатором.
    const student = this.students.find(s => s.id === studentId);
    
    // Перевіряємо існування студента.
    if (!student) {
      throw new Error(`Студента з ідентифікатором ${studentId} не знайдено.`);
    }

    // Виконуємо валідацію зміни статусу.
    this.validateStatusChange(student.status, newStatus);
    
    // Зберігаємо старий статус для повідомлення.
    const oldStatus = student.status;
    
    // Оновлюємо статус студента.
    student.status = newStatus;
    
    // Виводимо повідомлення про зміну статусу.
    console.log(`Статус студента ${student.fullName} змінено з ${oldStatus} на ${newStatus}.`);
  }

  /**
   * Метод для отримання списку студентів за факультетом.
   * Повертає масив студентів вказаного факультету.
   */
  getStudentsByFaculty(faculty: Faculty): Student[] {
    // Фільтруємо студентів за вказаним факультетом.
    return this.students.filter(student => student.faculty === faculty);
  }

  /**
   * Метод для отримання всіх оцінок конкретного студента.
   * Повертає масив оцінок студента за всіма курсами.
   */
  getStudentGrades(studentId: number): GradeRecord[] {
    // Знаходимо студента за ідентифікатором.
    const student = this.students.find(s => s.id === studentId);
    
    // Перевіряємо існування студента
    if (!student) {
      throw new Error(`Студента з ідентифікатором ${studentId} не знайдено.`);
    }

    // Фільтруємо оцінки за ідентифікатором студента.
    return this.grades.filter(grade => grade.studentId === studentId);
  }

  /**
   * Метод для отримання доступних курсів для факультету та семестру.
   * Повертає курси, на які ще можна записатися.
   */
  getAvailableCourses(faculty: Faculty, semester: Semester): Course[] {
    // Фільтруємо курси за факультетом, семестром та наявністю вільних місць.
    return this.courses.filter(course => 
      course.faculty === faculty && 
      course.semester === semester &&
      course.enrolledStudents < course.maxStudents
    );
  }

  /**
   * Метод для розрахунку середнього балу студента.
   * Повертає середнє арифметичне всіх оцінок студента.
   */
  calculateAverageGrade(studentId: number): number {
    // Отримуємо всі оцінки студента.
    const studentGrades = this.getStudentGrades(studentId);
    
    // Якщо оцінок немає - повертаємо 0.
    if (studentGrades.length === 0) {
      return 0;
    }

    // Обчислюємо суму всіх оцінок.
    const sum = studentGrades.reduce((total, gradeRecord) => total + gradeRecord.grade, 0);
    
    // Повертаємо середнє значення, округлене до 2 знаків після коми.
    return Number((sum / studentGrades.length).toFixed(2));
  }

  /**
   * Метод для отримання списку відмінників факультету.
   * Відмінником вважається студент з середнім балом 5.0.
   */
  getTopStudentsByFaculty(faculty: Faculty): Student[] {
    // Отримуємо всіх студентів факультету.
    const facultyStudents = this.getStudentsByFaculty(faculty);
    
    // Фільтруємо студентів, залишаючи тільки відмінників.
    return facultyStudents.filter(student => {
      // Обчислюємо середній бал студента
      const averageGrade = this.calculateAverageGrade(student.id);
      
      // Залишаємо тільки студентів з середнім балом 5.0.
      return averageGrade >= GradeValue.Excellent;
    });
  }

  /**
   * Метод для додавання нового навчального курсу.
   * Приймає дані курсу без ідентифікатора та лічильника студентів.
   * Повертає об'єкт курсу з присвоєним ідентифікатором.
   */
  addCourse(courseData: Omit<Course, "id" | "enrolledStudents">): Course {
    // Створюємо новий курс з унікальним ідентифікатором
    const newCourse: Course = {
      id: this.nextCourseId++,       // Присвоюємо ідентифікатор та збільшуємо лічильник.
      enrolledStudents: 0,           // Ініціалізуємо лічильник студентів нулем.
      ...courseData                  // Копіюємо всі передані дані курсу.
    };
    
    // Додаємо новий курс до загального списку.
    this.courses.push(newCourse);
    
    // Виводимо повідомлення про успішне додавання курсу.
    console.log(`Курс "${courseData.name}" додано до системи.`);
    
    // Повертаємо створений об'єкт курсу.
    return newCourse;
  }

  /**
   * Метод для отримання всіх студентів системи.
   * Використовується для внутрішніх потреб та демонстрації.
   */
  getAllStudents(): Student[] {
    return this.students;
  }

  /**
   * Метод для отримання всіх курсів системи.
   * Використовується для внутрішніх потреб та демонстрації.
   */
  getAllCourses(): Course[] {
    return this.courses;
  }

  // - ПРИВАТНІ МЕТОДИ ВАЛІДАЦІЇ.

  /**
   * Приватний метод для валідації зміни статусу студента.
   * Перевіряє, чи допустимий перехід між статусами.
   */
  private validateStatusChange(oldStatus: StudentStatus, newStatus: StudentStatus): void {
    // Перевіряємо, чи не намагаються змінити статус виключеного або випускника.
    if ((oldStatus === StudentStatus.Expelled || oldStatus === StudentStatus.Graduated) && 
        newStatus !== oldStatus) {
      throw new Error(`Не можна змінити статус з ${oldStatus} на ${newStatus}.`);
    }

    // Перевіряємо, чи не намагаються активувати випускника або виключеного студента.
    if ((oldStatus === StudentStatus.Graduated || oldStatus === StudentStatus.Expelled) && 
        newStatus === StudentStatus.Active) {
      throw new Error(`Не можна повернути статус "Active" з ${oldStatus}.`);
    }
  }
}

// - ФУНКЦІЯ ДЛЯ ДЕМОНСТРАЦІЇ РОБОТИ СИСТЕМИ.

/**
 * Функція для демонстрації всіх можливостей системи управління університетом.
 * Створює тестові дані та показує роботу всіх методів.
 */
function demonstrateSystem(): void {
  // Виводимо заголовок демонстрації
  console.log('ДЕМОНСТРАЦІЯ РОБОТИ СИСТЕМИ УПРАВЛІННЯ УНІВЕРСИТЕТОМ:');
  console.log('');

  // Створюємо новий екземпляр системи управління
  const universitySystem = new UniversityManagementSystem();

  // Додаємо навчальні курси до системи
  console.log('1. ДОДАВАННЯ НАВЧАЛЬНИХ КУРСІВ:');
  
  // Додаємо курс з програмування на TypeScript
  universitySystem.addCourse({
    name: "Програмування на TypeScript",
    type: CourseType.Mandatory,
    credits: 6,
    semester: Semester.First,
    faculty: Faculty.Computer_Science,
    maxStudents: 30
  });

  // Додаємо курс з веб-розробки
  universitySystem.addCourse({
    name: "Веб-розробка",
    type: CourseType.Optional,
    credits: 4,
    semester: Semester.First,
    faculty: Faculty.Computer_Science,
    maxStudents: 25
  });

  // Додаємо курс з мікроекономіки
  universitySystem.addCourse({
    name: "Мікроекономіка",
    type: CourseType.Mandatory,
    credits: 5,
    semester: Semester.First,
    faculty: Faculty.Economics,
    maxStudents: 40
  });

  // Зараховуємо студентів до університету
  console.log('\n2. ЗАРАХУВАННЯ СТУДЕНТІВ:');
  
  // Зараховуємо першого студента
  const student1 = universitySystem.enrollStudent({
    fullName: "Іван Петренко",
    faculty: Faculty.Computer_Science,
    year: 2,
    status: StudentStatus.Active,
    enrollmentDate: new Date('2023-09-01'),
    groupNumber: "CS-202"
  });

  // Зараховуємо другого студента
  const student2 = universitySystem.enrollStudent({
    fullName: "Марія Коваленко",
    faculty: Faculty.Computer_Science,
    year: 2,
    status: StudentStatus.Active,
    enrollmentDate: new Date('2023-09-01'),
    groupNumber: "CS-202"
  });

  // Зараховуємо третього студента
  const student3 = universitySystem.enrollStudent({
    fullName: "Олександр Сидоренко",
    faculty: Faculty.Economics,
    year: 1,
    status: StudentStatus.Active,
    enrollmentDate: new Date('2023-09-01'),
    groupNumber: "EC-101"
  });

  // Реєструємо студентів на курси
  console.log('\n3. РЕЄСТРАЦІЯ СТУДЕНТІВ НА КУРСИ:');
  
  // Виконуємо реєстрації в блоці try-catch для перехоплення помилок
  try {
    universitySystem.registerForCourse(student1.id, 1);
    universitySystem.registerForCourse(student2.id, 1);
    universitySystem.registerForCourse(student1.id, 2);
    universitySystem.registerForCourse(student3.id, 3);
  } catch (error: any) {
    // Виводимо повідомлення про помилку реєстрації
    console.error("Помилка реєстрації:", error.message);
  }

  // Виставляємо оцінки студентам
  console.log('\n4. ВИСТАВЛЕННЯ ОЦІНОК:');
  
  // Виконуємо виставлення оцінок в блоці try-catch для перехоплення помилок
  try {
    universitySystem.setGrade(student1.id, 1, GradeValue.Excellent);
    universitySystem.setGrade(student1.id, 2, GradeValue.Good);
    universitySystem.setGrade(student2.id, 1, GradeValue.Satisfactory);
  } catch (error: any) {
    // Виводимо повідомлення про помилку виставлення оцінки
    console.error("Помилка виставлення оцінки:", error.message);
  }

  // Демонструємо роботу всіх методів системи
  console.log('\n5. ДЕМОНСТРАЦІЯ РОБОТИ МЕТОДІВ СИСТЕМИ:');
  
  // Отримуємо студентів факультету комп'ютерних наук
  console.log('\nСтуденти факультету Computer Science:');
  universitySystem.getStudentsByFaculty(Faculty.Computer_Science).forEach(student => {
    console.log(`- ${student.fullName} (група ${student.groupNumber}).`);
  });

  // Отримуємо оцінки першого студента
  console.log('\nОцінки студента Іван Петренко:');
  universitySystem.getStudentGrades(student1.id).forEach(grade => {
    // Знаходимо курс за ідентифікатором для виведення назви
    const course = universitySystem.getAllCourses().find(c => c.id === grade.courseId);
    console.log(`- ${course?.name}: ${grade.grade}.`);
  });

  // Обчислюємо середній бал першого студента
  console.log(`\nСередній бал студента Іван Петренко: ${universitySystem.calculateAverageGrade(student1.id)}.`);

  // Отримуємо доступні курси для факультету комп'ютерних наук у першому семестрі
  console.log('\nДоступні курси для факультету Computer Science, 1 семестр:');
  universitySystem.getAvailableCourses(Faculty.Computer_Science, Semester.First).forEach(course => {
    console.log(`- ${course.name} (${course.enrolledStudents}/${course.maxStudents} студентів).`);
  });

  // Отримуємо список відмінників факультету комп'ютерних наук
  console.log('\nВідмінники факультету Computer Science:');
  const topStudents = universitySystem.getTopStudentsByFaculty(Faculty.Computer_Science);
  
  // Перевіряємо, чи є відмінники
  if (topStudents.length > 0) {
    topStudents.forEach(student => {
      console.log(`- ${student.fullName}.`);
    });
  } else {
    console.log('- Відмінників не знайдено.');
  }

  // Демонструємо зміну статусу студента
  console.log('\n6. ЗМІНА СТАТУСУ СТУДЕНТА:');
  
  // Виконуємо зміну статусу в блоці try-catch для перехоплення помилок
  try {
    universitySystem.updateStudentStatus(student1.id, StudentStatus.Graduated);
  } catch (error: any) {
    // Виводимо повідомлення про помилку зміни статусу
    console.error("Помилка зміни статусу:", error.message);
  }

  // Виводимо завершальне повідомлення
  console.log('\n- ДЕМОНСТРАЦІЯ ЗАВЕРШЕНА.');
}

// Запускаємо демонстрацію роботи системи
demonstrateSystem();