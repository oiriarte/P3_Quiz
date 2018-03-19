const Sequelize = require ('sequelize');
const {log, biglog, errorlog, colorize} = require ("./out");
const {models} = require('./model');

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


const validateId = id => {

    return new Sequelize.Promise ((resolve, reject) => {
        if (typeof id === "undefined") {
            reject (new Error(`Falta parámetro <id>.`));
        } else {
            id = parseInt(id);
            if (Number.isNaN(id)) {
                reject(new Error(`El valor del parámetro <id> no es un número.`));
            } else {
                resolve(id);
            }
        }
    });
};


exports.listCmd = rl => {
    models.quizzes.findAll()
    .each(quiz => {
            log(`[${colorize(quiz.id, 'magenta')}] ${quiz.question}`);
    })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
    });
};


exports.quitCmd = rl => {
    rl.close();
    rl.prompt();
};

exports.creditsCmd = rl => {
    log('Autores de la práctica:');
    log('Oscar Iriarte Cariño', 'green');
    log('Victor Alvarez Provencio', 'green');
    rl.prompt();
};

exports.playCmd = rl => {

  		let puntuacion = 0; 
  		let toBeResolved= []; 

  		const playOne = () => {
        return new Promise ((resolve, reject) => {
  				if(toBeResolved.length === 0) {
            log(' No hay más preguntas','blue');
            log(' Fin del juego. Aciertos: ');
  					resolve();
  					return;
  				}
  				let pos = Math.floor(Math.random()*toBeResolved.length);
  				let quiz = toBeResolved[pos];
  		    toBeResolved.splice(pos, 1); 
  		    makeQuestion(rl, quiz.question)
  		    .then(answer => {
            if(answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
              puntuacion++;
  				    log(`  CORRECTO - Lleva ${puntuacion} aciertos`);
  				    resolve(playOne());
            }else{
              log('  INCORRECTO ');
              log(`  Fin del juego. Aciertos: ${puntuacion} `);
  				    resolve();
  			    }
  		    })
  	     })
  	  }
  		models.quiz.findAll({raw: true}) 
  		.then(quizzes => {
  			toBeResolved= quizzes;
      })
  		.then(() => {
  		 	return playOne(); //es necesario esperar a que la promesa acabe, por eso no es un return a secas
  		 })
  		.catch(e => {
  			errorlog("Error:" + e); //usar errorlog con colores
  		})
  		.then(() => {
  			biglog(puntuacion, 'green');
  			rl.prompt();
  		})
};

exports.editCmd = (rl, id) => {
    validateId(id)
    .then(id => models.quiz.findById(id))
    .then (quiz => {
        if (!quiz) {
            throw new Error (`No existe un quiz asociado al id = ${id}.`);
        }

        process.stdout.isTTY && setTimeout(() => {rl.write(qiuz.question)}, 0);
        return makeQuestion(rl, 'Introduzca la pregunta: ')
        .then (q => {
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
            return makeQuestion(rl, 'Introduzca la respuesta: ')
            .then (a => {
                quiz.question = q;
                quiz.answer = a;
                return quiz;
            });
        });
    })
    .then(quiz => {
        return quiz.save();
    })
    .then(quiz => {
        log(`Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);

    })
    .catch (Sequelize.ValidationError, error => {
        errorlog('El quiz es erroneo: ');
        error.errors.forEach(({message}) => errorlog(message));
    })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
    });
};




exports.showCmd = (rl, id) => {
    validateId(id)
    .then (id => models.quiz.findById(id))
    .then (quiz => {
        if (!quiz) {
            throw new Error (`No existe un quiz asociado al id = ${id}.`);
        }
        log(`[${colrize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
    })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
    });
};


exports.testCmd = (rl, id) => {
     validateId(id)
           .then(id => models.quiz.findById(id))
           .then(quiz => {
                if(!quiz){
                    throw new Error(`No existe un quiz asociado al id=${id}.`);
                }
                makeQuestion(rl,quiz.question)
                .then(answer => {
                  if(answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
  			         log('Su respuesta es correcta.','black');
                     biglog("CORRECTA", 'green');
                     rl.prompt();
  				    
                  }else{
                     log('Su respuesta es incorrecta.','black');
                     biglog("INCORRECTA", 'red');
                     rl.prompt();
  			      }
  		        });
             })
         .catch(Sequelize.ValidationError, error => {
         	errorlog('El quiz es erroneo:');
         	error.errors.forEach(({message}) => errorlog(message));
         })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() =>{
            rl.prompt();
        }); 
           
};
const makeQuestion = (rl, text) => {

    return new Sequelize.Promise ((resolve, reject) => {
        rl.question (colorize(text, 'red'), answer => {
            resolve(answer.trim());
        });
    });
};




exports.addCmd = rl => {
  makeQuestion(rl, 'Introduzca una pregunta: ')
    .then(q => {
        return makeQuestion(rl, 'Introduzca la respuesta: ')
        .then(a => {
            return {question: q, answer: a};
        });
    })
    .then(quiz => {
        return models.quiz.create(quiz);
    })
    .then((quiz) => {
        log(` ${colorize('Se ha añadido.', 'blue')}: ${quiz.question} ${colorize('=>', 'blue')} ${quiz.answer}`);
    })
    .catch(Sequelize.ValidationError, error => {
        errorlog('El quiz es erróneo.');
        error.errors.forEach(({message}) => errorlog(message));
    })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
  });   
};
    



