"use strict";
const professors = [];
const classrooms = [];
const courses = [];
const schedule = [];
let nextLessonId = 1;
const WORK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
    "8:30-10:00", "10:15-11:45", "12:15-13:45",
    "14:00-15:30", "15:45-17:15"
];
function addProfessor(professor) {
    const existingProfessor = professors.find(p => p.id === professor.id);
    if (!existingProfessor) {
        professors.push(professor);
    }
}
function addClassroom(classroom) {
    const existingClassroom = classrooms.find(c => c.number === classroom.number);
    if (!existingClassroom) {
        classrooms.push(classroom);
    }
}
function addCourse(course) {
    const existingCourse = courses.find(c => c.id === course.id);
    if (!existingCourse) {
        courses.push(course);
    }
}
function validateLesson(lesson) {
    for (const scheduled of schedule) {
        if (scheduled.dayOfWeek !== lesson.dayOfWeek || scheduled.timeSlot !== lesson.timeSlot) {
            continue;
        }
        if (scheduled.professorId === lesson.professorId) {
            return {
                type: "ProfessorConflict",
                conflictingLesson: scheduled,
                newLesson: lesson
            };
        }
        if (scheduled.classroomNumber === lesson.classroomNumber) {
            return {
                type: "ClassroomConflict",
                conflictingLesson: scheduled,
                newLesson: lesson
            };
        }
    }
    return null;
}
function addLesson(lesson) {
    const professorExists = professors.some(p => p.id === lesson.professorId);
    const courseExists = courses.some(c => c.id === lesson.courseId);
    const classroomExists = classrooms.some(c => c.number === lesson.classroomNumber);
    if (!professorExists || !courseExists || !classroomExists) {
        return { success: false };
    }
    const conflict = validateLesson(lesson);
    if (conflict) {
        return { success: false, conflict };
    }
    const scheduledLesson = {
        ...lesson,
        lessonId: nextLessonId++
    };
    schedule.push(scheduledLesson);
    return { success: true, lessonId: scheduledLesson.lessonId };
}
function findAvailableClassrooms(timeSlot, dayOfWeek) {
    const occupiedClassrooms = new Set(schedule
        .filter(lesson => lesson.dayOfWeek === dayOfWeek && lesson.timeSlot === timeSlot)
        .map(lesson => lesson.classroomNumber));
    return classrooms.filter(classroom => !occupiedClassrooms.has(classroom.number));
}
function getProfessorSchedule(professorId) {
    return schedule.filter(lesson => lesson.professorId === professorId);
}
function getClassroomSchedule(classroomNumber) {
    return schedule.filter(lesson => lesson.classroomNumber === classroomNumber);
}
function getClassroomUtilization(classroomNumber) {
    const totalSlots = WORK_DAYS.length * TIME_SLOTS.length;
    const usedSlots = schedule.filter(lesson => lesson.classroomNumber === classroomNumber).length;
    return Number(((usedSlots / totalSlots) * 100).toFixed(2));
}
function getMostPopularCourseType() {
    const typeCounts = new Map();
    schedule.forEach(lesson => {
        const course = courses.find(c => c.id === lesson.courseId);
        if (course) {
            typeCounts.set(course.type, (typeCounts.get(course.type) || 0) + 1);
        }
    });
    let mostPopular = "Lecture";
    let maxCount = 0;
    typeCounts.forEach((count, type) => {
        if (count > maxCount) {
            maxCount = count;
            mostPopular = type;
        }
    });
    return mostPopular;
}
function getBusiestProfessors() {
    const professorWorkload = new Map();
    schedule.forEach(lesson => {
        professorWorkload.set(lesson.professorId, (professorWorkload.get(lesson.professorId) || 0) + 1);
    });
    return Array.from(professorWorkload.entries())
        .sort(([, a], [, b]) => b - a)
        .map(([professorId]) => professors.find(p => p.id === professorId))
        .filter((p) => p !== undefined)
        .slice(0, 5);
}
function reassignClassroom(lessonId, newClassroomNumber) {
    const lessonIndex = schedule.findIndex(lesson => lesson.lessonId === lessonId);
    if (lessonIndex === -1)
        return false;
    const lesson = schedule[lessonIndex];
    const classroomExists = classrooms.some(c => c.number === newClassroomNumber);
    if (!classroomExists)
        return false;
    const hasConflict = schedule.some(scheduled => scheduled.lessonId !== lessonId &&
        scheduled.classroomNumber === newClassroomNumber &&
        scheduled.dayOfWeek === lesson.dayOfWeek &&
        scheduled.timeSlot === lesson.timeSlot);
    if (hasConflict)
        return false;
    schedule[lessonIndex] = { ...lesson, classroomNumber: newClassroomNumber };
    return true;
}
function cancelLesson(lessonId) {
    const lessonIndex = schedule.findIndex(lesson => lesson.lessonId === lessonId);
    if (lessonIndex === -1)
        return false;
    schedule.splice(lessonIndex, 1);
    return true;
}
function rescheduleLesson(lessonId, newDay, newTime) {
    const lessonIndex = schedule.findIndex(lesson => lesson.lessonId === lessonId);
    if (lessonIndex === -1)
        return false;
    const lesson = schedule[lessonIndex];
    const rescheduledLesson = {
        ...lesson,
        dayOfWeek: newDay,
        timeSlot: newTime
    };
    const conflict = validateLesson(rescheduledLesson);
    if (conflict)
        return false;
    schedule[lessonIndex] = { ...rescheduledLesson, lessonId };
    return true;
}
function findAvailableTimeSlots(professorId, classroomNumber) {
    const availableSlots = [];
    WORK_DAYS.forEach(day => {
        TIME_SLOTS.forEach(slot => {
            const hasConflict = schedule.some(lesson => {
                if (lesson.dayOfWeek !== day || lesson.timeSlot !== slot)
                    return false;
                if (professorId && lesson.professorId === professorId)
                    return true;
                if (classroomNumber && lesson.classroomNumber === classroomNumber)
                    return true;
                return false;
            });
            if (!hasConflict) {
                availableSlots.push({ day, slot });
            }
        });
    });
    return availableSlots;
}
function getScheduleStatistics() {
    return {
        totalLessons: schedule.length,
        totalProfessors: professors.length,
        totalClassrooms: classrooms.length,
        totalCourses: courses.length,
        utilizationRate: Number((schedule.length / (WORK_DAYS.length * TIME_SLOTS.length * classrooms.length) * 100).toFixed(2)),
        mostPopularCourseType: getMostPopularCourseType(),
        busiestProfessors: getBusiestProfessors().map(p => p.name)
    };
}
function initializeDemoData() {
    addProfessor({ id: 1, name: "Доктор Сміт", department: "Комп'ютерні науки" });
    addProfessor({ id: 2, name: "Професор Джонсон", department: "Математика" });
    addProfessor({ id: 3, name: "Доктор Браун", department: "Фізика" });
    addClassroom({ number: "A101", capacity: 30, hasProjector: true });
    addClassroom({ number: "B202", capacity: 25, hasProjector: false });
    addClassroom({ number: "C303", capacity: 50, hasProjector: true });
    addCourse({ id: 101, name: "Алгоритми", type: "Lecture" });
    addCourse({ id: 102, name: "Математичний аналіз", type: "Practice" });
    addCourse({ id: 103, name: "Квантова фізика", type: "Lab" });
}
function runDemo() {
    initializeDemoData();
    console.log("=== ТЕСТУВАННЯ СИСТЕМИ УПРАВЛІННЯ РОЗКЛАДОМ ===");
    console.log("");
    const lesson1 = {
        courseId: 101,
        professorId: 1,
        classroomNumber: "A101",
        dayOfWeek: "Monday",
        timeSlot: "8:30-10:00"
    };
    const result1 = addLesson(lesson1);
    console.log("Додавання заняття 1:", result1.success ? "Успішно." : "Помилка.");
    const lesson2 = {
        courseId: 102,
        professorId: 2,
        classroomNumber: "A101",
        dayOfWeek: "Monday",
        timeSlot: "8:30-10:00"
    };
    const result2 = addLesson(lesson2);
    console.log("Додавання заняття 2 (конфлікт):", result2.success ? "Успішно." : `Помилка - ${result2.conflict?.type}.`);
    const lesson3 = {
        courseId: 103,
        professorId: 3,
        classroomNumber: "B202",
        dayOfWeek: "Tuesday",
        timeSlot: "10:15-11:45"
    };
    const result3 = addLesson(lesson3);
    console.log("Додавання заняття 3:", result3.success ? "Успішно." : "Помилка.");
    const available = findAvailableClassrooms("8:30-10:00", "Monday");
    console.log("Вільні аудиторії в понеділок о 8:30-10:00:", available.map(room => room.number) + ".");
    const stats = getScheduleStatistics();
    console.log("");
    console.log("Статистика системи:", stats);
    console.log("");
    console.log("Завантаженість аудиторій:");
    classrooms.forEach(room => {
        const utilization = getClassroomUtilization(room.number);
        console.log(`Аудиторія ${room.number}: ${utilization}%.`);
    });
}
runDemo();
//# sourceMappingURL=index.js.map