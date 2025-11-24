"use strict";
var StudentStatus;
(function (StudentStatus) {
    StudentStatus["Active"] = "Active";
    StudentStatus["Academic_Leave"] = "Academic_Leave";
    StudentStatus["Graduated"] = "Graduated";
    StudentStatus["Expelled"] = "Expelled";
})(StudentStatus || (StudentStatus = {}));
var CourseType;
(function (CourseType) {
    CourseType["Mandatory"] = "Mandatory";
    CourseType["Optional"] = "Optional";
    CourseType["Special"] = "Special";
})(CourseType || (CourseType = {}));
var Semester;
(function (Semester) {
    Semester["First"] = "First";
    Semester["Second"] = "Second";
})(Semester || (Semester = {}));
var GradeValue;
(function (GradeValue) {
    GradeValue[GradeValue["Excellent"] = 5] = "Excellent";
    GradeValue[GradeValue["Good"] = 4] = "Good";
    GradeValue[GradeValue["Satisfactory"] = 3] = "Satisfactory";
    GradeValue[GradeValue["Unsatisfactory"] = 2] = "Unsatisfactory";
})(GradeValue || (GradeValue = {}));
var Faculty;
(function (Faculty) {
    Faculty["Computer_Science"] = "Computer_Science";
    Faculty["Economics"] = "Economics";
    Faculty["Law"] = "Law";
    Faculty["Engineering"] = "Engineering";
})(Faculty || (Faculty = {}));
class UniversityManagementSystem {
    constructor() {
        this.students = [];
        this.courses = [];
        this.grades = [];
        this.registrations = [];
        this.nextStudentId = 1;
        this.nextCourseId = 1;
    }
    enrollStudent(studentData) {
        const newStudent = {
            id: this.nextStudentId++,
            ...studentData
        };
        this.students.push(newStudent);
        console.log(`Студента ${studentData.fullName} зараховано на факультет ${studentData.faculty}.`);
        return newStudent;
    }
    registerForCourse(studentId, courseId) {
        const student = this.students.find(s => s.id === studentId);
        const course = this.courses.find(c => c.id === courseId);
        if (!student) {
            throw new Error(`Студента з ідентифікатором ${studentId} не знайдено.`);
        }
        if (!course) {
            throw new Error(`Курс з ідентифікатором ${courseId} не знайдено.`);
        }
        if (student.status !== StudentStatus.Active) {
            throw new Error(`Студент ${student.fullName} не може реєструватися на курси через статус: ${student.status}.`);
        }
        if (student.faculty !== course.faculty) {
            throw new Error(`Студент факультету ${student.faculty} не може реєструватися на курс факультету ${course.faculty}.`);
        }
        if (course.enrolledStudents >= course.maxStudents) {
            throw new Error(`Курс "${course.name}" вже заповнений. Максимальна кількість: ${course.maxStudents}.`);
        }
        const existingRegistration = this.registrations.find(r => r.studentId === studentId && r.courseId === courseId);
        if (existingRegistration) {
            throw new Error(`Студент вже зареєстрований на курс "${course.name}".`);
        }
        this.registrations.push({ studentId, courseId });
        course.enrolledStudents++;
        console.log(`Студента ${student.fullName} зареєстровано на курс "${course.name}".`);
    }
    setGrade(studentId, courseId, grade) {
        const student = this.students.find(s => s.id === studentId);
        const course = this.courses.find(c => c.id === courseId);
        if (!student) {
            throw new Error(`Студента з ідентифікатором ${studentId} не знайдено.`);
        }
        if (!course) {
            throw new Error(`Курс з ідентифікатором ${courseId} не знайдено.`);
        }
        const isRegistered = this.registrations.some(r => r.studentId === studentId && r.courseId === courseId);
        if (!isRegistered) {
            throw new Error(`Студент ${student.fullName} не зареєстрований на курс "${course.name}".`);
        }
        const existingGrade = this.grades.find(g => g.studentId === studentId && g.courseId === courseId);
        if (existingGrade) {
            existingGrade.grade = grade;
            existingGrade.date = new Date();
        }
        else {
            this.grades.push({
                studentId,
                courseId,
                grade,
                date: new Date(),
                semester: course.semester
            });
        }
        console.log(`Студенту ${student.fullName} виставлено оцінку ${grade} за курс "${course.name}".`);
    }
    updateStudentStatus(studentId, newStatus) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) {
            throw new Error(`Студента з ідентифікатором ${studentId} не знайдено.`);
        }
        this.validateStatusChange(student.status, newStatus);
        const oldStatus = student.status;
        student.status = newStatus;
        console.log(`Статус студента ${student.fullName} змінено з ${oldStatus} на ${newStatus}.`);
    }
    getStudentsByFaculty(faculty) {
        return this.students.filter(student => student.faculty === faculty);
    }
    getStudentGrades(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) {
            throw new Error(`Студента з ідентифікатором ${studentId} не знайдено.`);
        }
        return this.grades.filter(grade => grade.studentId === studentId);
    }
    getAvailableCourses(faculty, semester) {
        return this.courses.filter(course => course.faculty === faculty &&
            course.semester === semester &&
            course.enrolledStudents < course.maxStudents);
    }
    calculateAverageGrade(studentId) {
        const studentGrades = this.getStudentGrades(studentId);
        if (studentGrades.length === 0) {
            return 0;
        }
        const sum = studentGrades.reduce((total, gradeRecord) => total + gradeRecord.grade, 0);
        return Number((sum / studentGrades.length).toFixed(2));
    }
    getTopStudentsByFaculty(faculty) {
        const facultyStudents = this.getStudentsByFaculty(faculty);
        return facultyStudents.filter(student => {
            const averageGrade = this.calculateAverageGrade(student.id);
            return averageGrade >= GradeValue.Excellent;
        });
    }
    addCourse(courseData) {
        const newCourse = {
            id: this.nextCourseId++,
            enrolledStudents: 0,
            ...courseData
        };
        this.courses.push(newCourse);
        console.log(`Курс "${courseData.name}" додано до системи.`);
        return newCourse;
    }
    getAllStudents() {
        return this.students;
    }
    getAllCourses() {
        return this.courses;
    }
    validateStatusChange(oldStatus, newStatus) {
        if ((oldStatus === StudentStatus.Expelled || oldStatus === StudentStatus.Graduated) &&
            newStatus !== oldStatus) {
            throw new Error(`Не можна змінити статус з ${oldStatus} на ${newStatus}.`);
        }
        if ((oldStatus === StudentStatus.Graduated || oldStatus === StudentStatus.Expelled) &&
            newStatus === StudentStatus.Active) {
            throw new Error(`Не можна повернути статус "Active" з ${oldStatus}.`);
        }
    }
}
function demonstrateSystem() {
    console.log('ДЕМОНСТРАЦІЯ РОБОТИ СИСТЕМИ УПРАВЛІННЯ УНІВЕРСИТЕТОМ:');
    console.log('');
    const universitySystem = new UniversityManagementSystem();
    console.log('1. ДОДАВАННЯ НАВЧАЛЬНИХ КУРСІВ:');
    universitySystem.addCourse({
        name: "Програмування на TypeScript",
        type: CourseType.Mandatory,
        credits: 6,
        semester: Semester.First,
        faculty: Faculty.Computer_Science,
        maxStudents: 30
    });
    universitySystem.addCourse({
        name: "Веб-розробка",
        type: CourseType.Optional,
        credits: 4,
        semester: Semester.First,
        faculty: Faculty.Computer_Science,
        maxStudents: 25
    });
    universitySystem.addCourse({
        name: "Мікроекономіка",
        type: CourseType.Mandatory,
        credits: 5,
        semester: Semester.First,
        faculty: Faculty.Economics,
        maxStudents: 40
    });
    console.log('\n2. ЗАРАХУВАННЯ СТУДЕНТІВ:');
    const student1 = universitySystem.enrollStudent({
        fullName: "Іван Петренко",
        faculty: Faculty.Computer_Science,
        year: 2,
        status: StudentStatus.Active,
        enrollmentDate: new Date('2023-09-01'),
        groupNumber: "CS-202"
    });
    const student2 = universitySystem.enrollStudent({
        fullName: "Марія Коваленко",
        faculty: Faculty.Computer_Science,
        year: 2,
        status: StudentStatus.Active,
        enrollmentDate: new Date('2023-09-01'),
        groupNumber: "CS-202"
    });
    const student3 = universitySystem.enrollStudent({
        fullName: "Олександр Сидоренко",
        faculty: Faculty.Economics,
        year: 1,
        status: StudentStatus.Active,
        enrollmentDate: new Date('2023-09-01'),
        groupNumber: "EC-101"
    });
    console.log('\n3. РЕЄСТРАЦІЯ СТУДЕНТІВ НА КУРСИ:');
    try {
        universitySystem.registerForCourse(student1.id, 1);
        universitySystem.registerForCourse(student2.id, 1);
        universitySystem.registerForCourse(student1.id, 2);
        universitySystem.registerForCourse(student3.id, 3);
    }
    catch (error) {
        console.error("Помилка реєстрації:", error.message);
    }
    console.log('\n4. ВИСТАВЛЕННЯ ОЦІНОК:');
    try {
        universitySystem.setGrade(student1.id, 1, GradeValue.Excellent);
        universitySystem.setGrade(student1.id, 2, GradeValue.Good);
        universitySystem.setGrade(student2.id, 1, GradeValue.Satisfactory);
    }
    catch (error) {
        console.error("Помилка виставлення оцінки:", error.message);
    }
    console.log('\n5. ДЕМОНСТРАЦІЯ РОБОТИ МЕТОДІВ СИСТЕМИ:');
    console.log('\nСтуденти факультету Computer Science:');
    universitySystem.getStudentsByFaculty(Faculty.Computer_Science).forEach(student => {
        console.log(`- ${student.fullName} (група ${student.groupNumber}).`);
    });
    console.log('\nОцінки студента Іван Петренко:');
    universitySystem.getStudentGrades(student1.id).forEach(grade => {
        const course = universitySystem.getAllCourses().find(c => c.id === grade.courseId);
        console.log(`- ${course?.name}: ${grade.grade}.`);
    });
    console.log(`\nСередній бал студента Іван Петренко: ${universitySystem.calculateAverageGrade(student1.id)}.`);
    console.log('\nДоступні курси для факультету Computer Science, 1 семестр:');
    universitySystem.getAvailableCourses(Faculty.Computer_Science, Semester.First).forEach(course => {
        console.log(`- ${course.name} (${course.enrolledStudents}/${course.maxStudents} студентів).`);
    });
    console.log('\nВідмінники факультету Computer Science:');
    const topStudents = universitySystem.getTopStudentsByFaculty(Faculty.Computer_Science);
    if (topStudents.length > 0) {
        topStudents.forEach(student => {
            console.log(`- ${student.fullName}.`);
        });
    }
    else {
        console.log('- Відмінників не знайдено.');
    }
    console.log('\n6. ЗМІНА СТАТУСУ СТУДЕНТА:');
    try {
        universitySystem.updateStudentStatus(student1.id, StudentStatus.Graduated);
    }
    catch (error) {
        console.error("Помилка зміни статусу:", error.message);
    }
    console.log('\n- ДЕМОНСТРАЦІЯ ЗАВЕРШЕНА.');
}
demonstrateSystem();
//# sourceMappingURL=index.js.map