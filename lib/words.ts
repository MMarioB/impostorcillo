export const categories = {
    animales: [
        "perro", "gato", "elefante", "jirafa", "león",
        "tigre", "oso", "mono", "cebra", "cocodrilo",
        "pingüino", "águila", "tiburón", "delfín", "tortuga",
        "caballo", "vaca", "cerdo", "oveja", "gallina",
        "conejo", "ratón", "ardilla", "zorro", "lobo",
        "ballena", "pulpo", "cangrejo", "medusa", "foca",
        "camello", "rinoceronte", "hipopótamo", "canguro", "koala",
        "panda", "gorila", "serpiente", "lagarto", "rana"
    ],
    peliculas: [
        "titanic", "matrix", "gladiator", "avatar", "inception",
        "joker", "frozen", "coco", "up", "shrek",
        "batman", "spiderman", "ironman", "alien", "terminator",
        "forrest gump", "el padrino", "pulp fiction", "interestellar", "origen",
        "toy story", "buscando a nemo", "el rey león", "aladdin", "mulan",
        "harry potter", "el señor de los anillos", "star wars", "jurassic park", "e.t.",
        "regreso al futuro", "indiana jones", "rocky", "rambo", "matrix",
        "piratas del caribe", "misión imposible", "fast and furious", "john wick", "deadpool"
    ],
    comida: [
        "pizza", "hamburguesa", "paella", "sushi", "tacos",
        "lasaña", "croquetas", "tortilla", "gazpacho", "fabada",
        "curry", "ramen", "kebab", "nachos", "falafel",
        "pasta", "arroz", "ensalada", "bocadillo", "sandwich",
        "pollo", "ternera", "cerdo", "pescado", "marisco",
        "patatas fritas", "nuggets", "hot dog", "burrito", "quesadilla",
        "helado", "tarta", "chocolate", "churros", "donuts",
        "croissant", "magdalena", "galletas", "flan", "natillas"
    ],
    profesiones: [
        "médico", "bombero", "profesor", "policía", "arquitecto",
        "abogado", "cocinero", "piloto", "electricista", "fontanero",
        "periodista", "veterinario", "enfermero", "albañil", "mecánico",
        "dentista", "farmacéutico", "psicólogo", "ingeniero", "programador",
        "diseñador", "fotógrafo", "músico", "actor", "director",
        "pintor", "escultor", "escritor", "traductor", "científico",
        "astronauta", "militar", "juez", "político", "economista",
        "agricultor", "pescador", "panadero", "carnicero", "peluquero"
    ],
    lugares: [
        "playa", "montaña", "hospital", "aeropuerto", "biblioteca",
        "supermercado", "cine", "estadio", "parque", "museo",
        "restaurante", "discoteca", "gimnasio", "iglesia", "zoo",
        "hotel", "camping", "piscina", "centro comercial", "mercado",
        "farmacia", "banco", "correos", "gasolinera", "parking",
        "universidad", "colegio", "guardería", "teatro", "ópera",
        "acuario", "circo", "casino", "spa", "bolera",
        "puerto", "estación", "metro", "plaza", "castillo"
    ],
    deportes: [
        "fútbol", "baloncesto", "tenis", "natación", "atletismo",
        "ciclismo", "boxeo", "golf", "rugby", "hockey",
        "voleibol", "balonmano", "béisbol", "surf", "esquí",
        "snowboard", "patinaje", "gimnasia", "judo", "karate",
        "taekwondo", "esgrima", "halterofilia", "remo", "vela",
        "escalada", "skate", "motocross", "fórmula 1", "rally"
    ],
    objetos: [
        "teléfono", "ordenador", "televisión", "nevera", "microondas",
        "lavadora", "aspiradora", "plancha", "secador", "batidora",
        "silla", "mesa", "sofá", "cama", "armario",
        "espejo", "lámpara", "reloj", "cuadro", "alfombra",
        "libro", "bolígrafo", "tijeras", "grapadora", "calculadora",
        "paraguas", "maleta", "mochila", "cartera", "gafas"
    ]
};

export type Category = keyof typeof categories;

export function getRandomWord(category: Category): string {
    const words = categories[category];
    return words[Math.floor(Math.random() * words.length)];
}