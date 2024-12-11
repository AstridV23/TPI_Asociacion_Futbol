import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const router = Router()
const prisma = new PrismaClient()

// crea un equipo
router.post('/equipo', async (req, res) => {
    try {
        // Extraer los datos del cuerpo de la solicitud
        const { Nombre, DT, Division_Id, DNI_Representante, Categoria_Id } = req.body;

        // Validar campos obligatorios
        if (!Nombre || !DT || !Division_Id || !DNI_Representante || !Categoria_Id) {
            return res.status(400).json({ error: 'Faltan campos obligatorios.' });
        }

        // Verificar si ya existe un equipo con el mismo nombre
        const equipoExistente = await prisma.equipo.findUnique({
            where: { Nombre },
        });

        if (equipoExistente) {
            return res.status(409).json({ error: 'Ya existe un equipo con ese nombre.' });
        }

        // Crear el nuevo equipo en la base de datos
        const nuevoEquipo = await prisma.equipo.create({
            data: {
                Nombre,
                DT,
                Division_Id,
                DNI_Representante,
                Categoria_Id,
            },
        });

        // Responder con el equipo creado
        res.status(201).json(nuevoEquipo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un error al crear el equipo.' });
    }
});

// trae los equipos compatibles
router.get('/equipos_compatibles', async (req, res) => {
    const { dni_jugador } = req.query;

    if (!dni_jugador) {
        return res.status(400).json({ error: 'El parámetro DNI_Jugador es obligatorio.' });
    }

    try {
        // Buscar a la persona por su DNI
        const persona = await prisma.persona.findUnique({
            where: { DNI: parseInt(dni_jugador) },
            select: { FechaNacimiento: true }, // Obtener solo la fecha de nacimiento
        });

        if (!persona) {
            return res.status(404).json({ error: 'No se encontró una persona con ese DNI.' });
        }

        // Calcular la edad actual del jugador
        const fechaNacimiento = new Date(persona.FechaNacimiento);
        const hoy = new Date();
        const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();

        // Ajustar si el cumpleaños aún no ocurrió este año
        const cumpleanosPasado =
            hoy.getMonth() > fechaNacimiento.getMonth() ||
            (hoy.getMonth() === fechaNacimiento.getMonth() && hoy.getDate() >= fechaNacimiento.getDate());
        const edadReal = cumpleanosPasado ? edad : edad - 1;

        // Buscar la categoría correspondiente según la edad
        const categoria = await prisma.categoria.findFirst({
            where: {
                Min_Edad: { lte: edadReal },
                Max_Edad: { gte: edadReal },
            },
        });

        if (!categoria) {
            return res.status(404).json({ error: 'No se encontró una categoría compatible para la edad del jugador.' });
        }

        // Buscar los equipos asociados a la categoría encontrada
        const equipos = await prisma.equipo.findMany({
            where: { Categoria_Id: categoria.Categoria_Id },
        });

        if (equipos.length === 0) {
            return res.status(404).json({ error: 'No existen equipos correspondientes para tu edad.' });
        }

        // Responder con los equipos compatibles
        res.status(200).json(equipos);
    } catch (error) {
        console.error("Error al obtener equipos compatibles:", error);
        res.status(500).json({ error: 'Error al obtener equipos compatibles.' });
    }
});

// busca por id de categoria
// ej: http://localhost:3000/api/equipos?categoriaId=3
router.get('/equipos', async (req, res) => {
    try {
        const { categoriaId } = req.query; // Obtén el ID de la categoría desde los parámetros de la query

        // Si no se proporciona una categoría, devolvemos un error
        if (!categoriaId) {
            return res.status(400).json({ error: 'Se debe proporcionar el ID de la categoría' });
        }

        // Consulta los equipos que pertenecen a la categoría especificada
        const equipos = await prisma.equipo.findMany({
            where: {
                Categoria_Id: parseInt(categoriaId) // Filtrar por Categoria_Id
            },
            include: {
                Categoria: true,  // Incluye la información de la categoría si la necesitas
                Division: true,   // Incluye la información de la división si la necesitas
            }
        });

        // Si no se encuentran equipos, devolvemos un mensaje adecuado
        if (equipos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron equipos en esta categoría' });
        }

        // Devolver los equipos encontrados
        res.json(equipos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un error al obtener los equipos' });
    }
});

// muestra todos los equipos
router.get('/equipos_mostrar', async (req, res) => {
    try {
        // Consulta todos los equipos en la base de datos
        const equipos = await prisma.equipo.findMany({
            include: {
                Categoria: true,  // Incluye la información de la categoría si la necesitas
                Division: true,   // Incluye la información de la división si la necesitas
            }
        });

        // Si no se encuentran equipos, devolver un mensaje adecuado
        if (equipos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron equipos' });
        }

        // Devolver todos los equipos
        res.json(equipos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un error al obtener los equipos' });
    }
});

router.put('/confirmar_jugador', async (req, res) => {

});

export default router