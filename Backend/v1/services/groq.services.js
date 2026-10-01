import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export const generarRecomendacionGroq = async (puntos, videojuegos) => {
    const listaVideojuegos = videojuegos.map((videojuego) => ({
        nombre: videojuego.nombre,
        precio: videojuego.precio,
        categoria: videojuego.categoria?.nombre || 'Sin categoría',
        metacritic: videojuego.puntajeMetacritic ?? 'Sin puntaje'
    }));

    const respuesta = await groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: `
                Un usuario tiene ${puntos} puntos disponibles para gastar en videojuegos.

                Estos son los videojuegos que puede comprar:
                ${JSON.stringify(listaVideojuegos)}

                Elegí un solo videojuego y recomendáselo al usuario.
                Explicá brevemente por qué lo recomendás.
                No inventes videojuegos que no estén en la lista.
                `
            }
        ],
        model: "openai/gpt-oss-20b"
    });

    return respuesta.choices[0].message.content;
};