const {log, biglog, errorlog, colorize} = require ("./out");
const model = require('./model');

/** Aqui empiezan las funciones
 *
 */

exports.helpCmd = rl => {
    log("Comandos:");
    log(" h|help - Muestra esta ayuda");
    log("list - Listar los quizzes existentes");
    log(" show <id> - Muestra la pregunta y la respuesta del quiz indicado");
    log(" add - Añadir un nuevo quiz interactivamente");
    log(" delete <id> - Borrar el quiz indicado");
    log(" edit <id> - Editar el quiz indicado");
    log(" test <id> - Probar el quiz indicado");
    log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes");
    log(" credits - Créditos");
    log(" q|quit - Salir ");
    rl.prompt();
};

exports.listCmd = rl => {
    model.getAll().forEach((quiz, id) => {
        log(`[${colorize(id, 'magenta')}]: ${quiz.question} `);
    });

    rl.prompt();
};

exports.quitCmd = rl => {
    rl.close();
};

exports.creditsCmd = rl => {
    log('Autores de la práctica:');
    log('Oscar Iriarte Cariño', 'green');
    log('Victor Alvarez Provencio', 'green');
    rl.prompt();
};

exports.playCmd = rl => {
    let score = 0
    let toBeResolved = [];

    for(let i=0; i<model.count(); i++){
        toBeResolved[i]=i;
        }

    const playStart = () =>{
        if(toBeResolved.length === 0){
            log("Se acabaron las preguntas");
            log("Fin del juego. Aciertos:");
            biglog(score, 'red');
            rl.prompt();
        }else{
            let id = toBeResolved[Math.floor((Math.random() * toBeResolved.length))];
            let quiz = model.getByIndex(id);
            toBeResolved.splice(toBeResolved.indexOf(id), 1);
            rl.question(`${colorize(quiz.question + '?', 'red')} `, answer => {     
                if(answer.toUpperCase().trim() === quiz.answer.toUpperCase().trim()){
                    score++;

                    log("CORRECTO - Lleva " + score + " aciertos.");
                    biglog('CORRECTA','green');
                    playStart();
                }else{
                    log('INCORRECTO');
                    log('Fin del juego. Aciertos:');
                    biglog(score, 'magenta');
                }
                rl.prompt();
            });
        }
    };
    playStart();
};


exports.editCmd = (rl, id) => {
    if (typeof id === "undefined"){
        errorlog('Falta el parámetro id');
        /*rl.prompt();
        */
    } else {
        try {
            const quiz = model.getByIndex(id);

            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
            rl.question(colorize('Introduzca una pregunta:' , 'red'), question => {

                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
                rl.question(colorize('Introduzca la respuesta' , 'red'), answer => {
            
                    model.update(id, question, answer);
                    log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>','magenta')} ${answer}`);
                    rl.prompt(); 
                });
            });       
        }catch(error) {
            errorlog(error.message);
            /*rl.prompt();
            */
        }
    }
};


exports.testCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog('Falta el parametro id.');
        rl.prompt();
    }else{
        try{
            const quiz = model.getByIndex(id);
            rl.question(quiz.question, answer => {
                if (answer.toUpperCase().trim() === quiz.answer.toUpperCase().trim()){
                    log('Su respuesta es correcta');
                    biglog('Correcto', 'green');
                }else{
                    log('Su respuesta es incorrecta.');
                    biglog('Incorrecto', 'red');
                }rl.prompt();
            });
        }catch(error){
            errorlog(error.message);
            rl.prompt();
        }
    }
       
};


exports.showCmd = (rl, id) => {
    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id`);
    } else {
        try {
            const quiz = model.getByIndex(id);
            log(`[${colorize(id, 'magenta')}]: ${quiz.question} &{colorize('=>', 'magenta')} ${quiz.answer}`);
        } catch(error) {
            errorlog(error.message);
        }
    }
    rl.prompt();
};

exports.addCmd = rl => {
    rl.question(colorize('Introduzca una pregunta:' , 'red'), question => {
        
        rl.question(colorize('Introduzca la respuesta' , 'red'), answer => {
            
            model.add(question, answer);
            log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>','magenta')} ${answer}`);
            rl.prompt();
        });
    });
};

exports.deleteCmd = (rl, id) => {
    if (typeof id === "undefined"){
        errorlog('Falta el parámetro id');
    } else {
        try {
            model.deleteByIndex(id);
        } catch(error) {
            errorlog(error.message);
        }
    }

    rl.prompt();
};
