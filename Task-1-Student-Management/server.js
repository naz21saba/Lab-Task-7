
const http = require('node:http');

let students = [];
let teachers = [];
let attendance = [];
let marks = [];

let nextStudentId = 1;
let nextTeacherId = 1;
let nextAttendanceId = 1;
let nextMarksId = 1;

function send(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
}

async function readBody(req) {
    let raw = '';

    for await (const chunk of req) {
        raw += chunk;
    }

    return JSON.parse(raw || '{}');
}

const server = http.createServer(async (req, res) => {

    // ---------------- STUDENTS CRUD ----------------

    if (req.method === 'GET' && req.url === '/students') {
        return send(res, 200, students);
    }

    if (req.method === 'GET' && req.url.startsWith('/students/')) {
        const id = Number(req.url.split('/')[2]);
        const student = students.find(student => student.id === id);

        if (!student) {
            return send(res, 404, { error: 'Student not found' });
        }

        return send(res, 200, student);
    }

    if (req.method === 'POST' && req.url === '/students') {
        try {
            const body = await readBody(req);

            if (!body.name) {
                return send(res, 400, { error: 'Student name is required' });
            }

            const student = {
                id: nextStudentId++,
                name: body.name,
                age: body.age,
                semester: body.semester
            };

            students.push(student);
            return send(res, 201, student);

        } catch (error) {
            return send(res, 400, { error: 'Invalid JSON' });
        }
    }

    if (req.method === 'PUT' && req.url.startsWith('/students/')) {
        try {
            const id = Number(req.url.split('/')[2]);
            const student = students.find(student => student.id === id);

            if (!student) {
                return send(res, 404, { error: 'Student not found' });
            }

            const body = await readBody(req);

            student.name = body.name || student.name;
            student.age = body.age || student.age;
            student.semester = body.semester || student.semester;

            return send(res, 200, student);

        } catch (error) {
            return send(res, 400, { error: 'Invalid JSON' });
        }
    }

    if (req.method === 'DELETE' && req.url.startsWith('/students/')) {
        const id = Number(req.url.split('/')[2]);
        const index = students.findIndex(student => student.id === id);

        if (index === -1) {
            return send(res, 404, { error: 'Student not found' });
        }

        const deletedStudent = students.splice(index, 1);
        return send(res, 200, {
            message: 'Student deleted',
            student: deletedStudent[0]
        });
    }

    // ---------------- TEACHERS CRUD ----------------

    if (req.method === 'GET' && req.url === '/teachers') {
        return send(res, 200, teachers);
    }

    if (req.method === 'GET' && req.url.startsWith('/teachers/')) {
        const id = Number(req.url.split('/')[2]);
        const teacher = teachers.find(teacher => teacher.id === id);

        if (!teacher) {
            return send(res, 404, { error: 'Teacher not found' });
        }

        return send(res, 200, teacher);
    }

    if (req.method === 'POST' && req.url === '/teachers') {
        try {
            const body = await readBody(req);

            if (!body.name) {
                return send(res, 400, { error: 'Teacher name is required' });
            }

            const teacher = {
                id: nextTeacherId++,
                name: body.name,
                subject: body.subject
            };

            teachers.push(teacher);
            return send(res, 201, teacher);

        } catch (error) {
            return send(res, 400, { error: 'Invalid JSON' });
        }
    }

    if (req.method === 'PUT' && req.url.startsWith('/teachers/')) {
        try {
            const id = Number(req.url.split('/')[2]);
            const teacher = teachers.find(teacher => teacher.id === id);

            if (!teacher) {
                return send(res, 404, { error: 'Teacher not found' });
            }

            const body = await readBody(req);

            teacher.name = body.name || teacher.name;
            teacher.subject = body.subject || teacher.subject;

            return send(res, 200, teacher);

        } catch (error) {
            return send(res, 400, { error: 'Invalid JSON' });
        }
    }

    if (req.method === 'DELETE' && req.url.startsWith('/teachers/')) {
        const id = Number(req.url.split('/')[2]);
        const index = teachers.findIndex(teacher => teacher.id === id);

        if (index === -1) {
            return send(res, 404, { error: 'Teacher not found' });
        }

        const deletedTeacher = teachers.splice(index, 1);
        return send(res, 200, {
            message: 'Teacher deleted',
            teacher: deletedTeacher[0]
        });
    }

    // ---------------- ATTENDANCE CRUD ----------------

    if (req.method === 'GET' && req.url === '/attendance') {
        return send(res, 200, attendance);
    }

    if (req.method === 'GET' && req.url.startsWith('/attendance/')) {
        const id = Number(req.url.split('/')[2]);
        const record = attendance.find(record => record.id === id);

        if (!record) {
            return send(res, 404, { error: 'Attendance record not found' });
        }

        return send(res, 200, record);
    }

    if (req.method === 'POST' && req.url === '/attendance') {
        try {
            const body = await readBody(req);

            if (!body.studentId || !body.status) {
                return send(res, 400, { error: 'studentId and status are required' });
            }

            const record = {
                id: nextAttendanceId++,
                studentId: body.studentId,
                date: body.date,
                status: body.status
            };

            attendance.push(record);
            return send(res, 201, record);

        } catch (error) {
            return send(res, 400, { error: 'Invalid JSON' });
        }
    }

    if (req.method === 'PUT' && req.url.startsWith('/attendance/')) {
        try {
            const id = Number(req.url.split('/')[2]);
            const record = attendance.find(record => record.id === id);

            if (!record) {
                return send(res, 404, { error: 'Attendance record not found' });
            }

            const body = await readBody(req);

            record.studentId = body.studentId || record.studentId;
            record.date = body.date || record.date;
            record.status = body.status || record.status;

            return send(res, 200, record);

        } catch (error) {
            return send(res, 400, { error: 'Invalid JSON' });
        }
    }

    if (req.method === 'DELETE' && req.url.startsWith('/attendance/')) {
        const id = Number(req.url.split('/')[2]);
        const index = attendance.findIndex(record => record.id === id);

        if (index === -1) {
            return send(res, 404, { error: 'Attendance record not found' });
        }

        const deletedRecord = attendance.splice(index, 1);
        return send(res, 200, {
            message: 'Attendance record deleted',
            attendance: deletedRecord[0]
        });
    }

    // ---------------- MARKS CRUD ----------------

    if (req.method === 'GET' && req.url === '/marks') {
        return send(res, 200, marks);
    }

    if (req.method === 'GET' && req.url.startsWith('/marks/')) {
        const id = Number(req.url.split('/')[2]);
        const record = marks.find(record => record.id === id);

        if (!record) {
            return send(res, 404, { error: 'Marks record not found' });
        }

        return send(res, 200, record);
    }

    if (req.method === 'POST' && req.url === '/marks') {
        try {
            const body = await readBody(req);

            if (!body.studentId || !body.subject || body.marks === undefined) {
                return send(res, 400, { error: 'studentId, subject and marks are required' });
            }

            const record = {
                id: nextMarksId++,
                studentId: body.studentId,
                subject: body.subject,
                marks: body.marks
            };

            marks.push(record);
            return send(res, 201, record);

        } catch (error) {
            return send(res, 400, { error: 'Invalid JSON' });
        }
    }

    if (req.method === 'PUT' && req.url.startsWith('/marks/')) {
        try {
            const id = Number(req.url.split('/')[2]);
            const record = marks.find(record => record.id === id);

            if (!record) {
                return send(res, 404, { error: 'Marks record not found' });
            }

            const body = await readBody(req);

            record.studentId = body.studentId || record.studentId;
            record.subject = body.subject || record.subject;

            if (body.marks !== undefined) {
                record.marks = body.marks;
            }

            return send(res, 200, record);

        } catch (error) {
            return send(res, 400, { error: 'Invalid JSON' });
        }
    }

    if (req.method === 'DELETE' && req.url.startsWith('/marks/')) {
        const id = Number(req.url.split('/')[2]);
        const index = marks.findIndex(record => record.id === id);

        if (index === -1) {
            return send(res, 404, { error: 'Marks record not found' });
        }

        const deletedRecord = marks.splice(index, 1);
        return send(res, 200, {
            message: 'Marks record deleted',
            marks: deletedRecord[0]
        });
    }

    return send(res, 404, { error: 'Route not found' });
});

server.listen(3004, function () {
    console.log('Student Management API running at http://localhost:3004');
});
