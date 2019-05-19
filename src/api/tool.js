'use strict'
const fs = require('fs');
const mysql = require( 'mysql' );
const path = require('path');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const create = (function(){


  const config = () => {


    let configName;
    let configObj;
    let configQuestion;

    const configRouteFields = (configRouteObj) => {
      rl.question('Add field: ', (field) => {
        if( field != '' ){
          configRouteObj.fields.push(field)
          configRouteFields(configRouteObj)
        }else{
          configObj.routes.push(configRouteObj)
          configRoute()
        }

      })
    }

    const configRoute = () => {
      let configRouteObj = {}
      rl.question('Route : ', (route) => {
        if( route != '' ){
          configRouteObj['route'] = route
        }else{
          return configFinalize()
        }
        rl.question('Database Table', (table) => {

          configRouteObj['table'] = key
          rl.question('Primary Key : ', (key) => {
            configRouteObj['key'] = key
            configRouteObj['methods'] = []
            rl.question('Add GET (y/n): ', (get) => {
              if( get === 'y' || get === '' ) configRouteObj.methods.push('get')
              rl.question('Add GET all:', (getall) => {
                if( getall === 'y' || getall === '' ) configRouteObj.methods.push('getAll')
                rl.question('Add PUT: ', (put) => {
                  if( put === 'y' || put === '' ) configRouteObj.methods.push('put')
                  rl.question('Add POST: ', (post) => {
                    if( post === 'y' || post === '') configRouteObj.methods.push('get')
                    rl.question('Add DELETE: ', (del) => {
                      if( del === 'y' || del === '' ) configRouteObj.methods.push('delete')

                      configRouteObj['fields'] = []
                      configRouteFields(configRouteObj)

                    })
                  })
                })
              })
            })
          })
        })
      })
    }

    const configFinalize = () =>{
      const configObjOutput = JSON.stringify(configObj, null, 2)
      console.log( configObjOutput )
      rl.question('Is this correct? (y/n)', (correct) => {
        if(correct === 'y' || correct === '' ){
          fs.writeFile(`./api/${configName}.json`, configObj, function(err) {
            if(err) {
              return console.log(err);
            }

            console.log(`Saved config data to ./api/${configName}.json`);
            rl.close();
          });
        }else{
          init(configObj);
        }
      });

    }

    const configDatabase = () =>{
      configQuestion = configObj.db.host ? `Database host (${configObj.db.host}) : ` : 'Database host : '
      rl.question(configQuestion, (host) => {
        if(!host === '') configObj.db['host'] = host
        configQuestion = configObj.db.user ? `Database user (${configObj.db.user}) : ` : 'Database user : '
        rl.question(configQuestion, (user) => {
          if(!user === '') configObj.db['user'] = user
          configQuestion = configObj.db.password ? `Database password (${configObj.db.password}) : ` : 'Database password : '
          rl.question(configQuestion, (pass) => {
            if(!pass === '') configObj.db['password'] = pass
            configQuestion = configObj.db.database ? `Database (${configObj.db.database}) : ` : 'Database : '
            rl.question(configQuestion, (database) => {
              let connObj = {
                host : configObj.db.host,
                user : configObj.db.user,
                password : configObj.db.password,
                database : databas
              }
              if(database === '' && configObj.db.database ){
                configRoute()
              }else{
                mysql.createConnection(connObj).connect((err) => {
                  if (err) {
                    console.warn(`Error connecting to database '${database}'` );
                  } else {
                    configObj.db['database'] = database
                    configObj['routes'] = []
                    configRoute()
                  }
                });
              }

            });
          });
        });
      });
    }

    const init = function(obj){
      obj ? configObj = obj : configObj = {}
      configQuestion = configObj.name ? `Name (${configObj.name}) : ` : 'Name : '
      rl.question(configQuestion, (name) => {
        name === '' ? configName = configObj.name : configName = name
        configQuestion = configObj.prefix ? `API prefix (${configObj.prefix}) : ` : 'API prefix : '
        rl.question(configQuestion, (prefix) => {
          if(!prefix === '') configObj['prefix'] = prefix
          configQuestion = configObj.port ? `Port number (${configObj.prefix}) : ` : 'Port number : '
          rl.question(configQuestion, (port) => {
            if(!port === '') portconfigObj['port'] = port
            if(!configObj.db) configObj['db'] = {}
            configDatabase()
          })
        });
      });
    }

    console.log('Create JSON configuration file')
    init();



  }

  return{
    config : config
  }
})()

const update = (function(){
  const config = () => {
    const configs = []
    const routes = []
    const directoryPath = path.join(__dirname, './');
    let configName, configObj
    console.log('Update JSON configuration file for running REST API service')
    fs.readdir(directoryPath, function (err, files) {

      let configs = [];
      files.forEach(function (file) {
        if(file.includes('.json')) configs.push(file.replace('.json',''))
      });

      if (err) {
        return console.log('Unable to scan directory: ' + err);
      }else{
        if(configs.length > 0 ) console.log(`Current configuration files (${configs.length}) in ${directoryPath}`)
      }


      for(let config of configs) {
        console.log(` - ${config}` )
      }

      if(configs.length > 0 ){
        rl.question('Enter config to update : ', (name) => {
          configName = name
          configObj = JSON.parse(fs.readFileSync(`./api/${name}.json`, 'utf8'))
          configProps(name)

        });
      }else{
        console.log(`No configuration files in found, generate a new file with node api/tool -c config` )
        rl.close();
      }
    });




    const configProps = (name) => {
      rl.question(`Enter property to update from '${name}' (prefix, db, routes) : `, (prop) => {
        if(prop === 'routes'){
          configRoutes(name)
        }else if(prop === 'prefix'){
          configPrefix(name)
        }else if(prop === 'db'){
          configDb(name)
        }
      })
    }

    const configRoutes = (name) => {
      console.log( `Current routes in '${name}'`)
      for( let routeObj of configObj.routes ){
        console.log(`- ${routeObj.route}`)
        routes.push(routeObj.route)
      }

      rl.question('Enter route to update or new route to add: ', (route) => {
        if( routes.includes(route) ){
          rl.question(`Field to update from route '${route}' (route,key,methods,fields)`, (field) => {

          });
        }else{
          rl.question('Key: ', (key) => {

          });
        }
      });
    }

      const configPrefix = (name) =>{
        rl.question(`Update prefix (current : ${configObj.prefix}) :`, (prefix) => {
          if(prefix != '') configObj.prefix = prefix
          configProps(name)
        });
      }

      const configDb = (name) =>{
        rl.question(`Enter property to update from db (host, user, password, database):`, (prop) => {
          if(prop === 'host'){
            rl.question(`Update host (current : ${configObj.db.host}):`, (host) => {
              if(host != '') configObj.db.host = host
              configDb(name)
            })
          }else if (prop === 'user') {
            rl.question(`Update user (current : ${configObj.db.user}):`, (user) => {
              if(user != '') configObj.db.user = user
              configDb(name)
            })
          }else if (prop === 'password') {
            rl.question(`Update password (current : ${configObj.db.password}):`, (password) => {
              if(password != '') configObj.db.password = password
              configDb(name)
            })
          }else if (prop === 'database') {
            rl.question(`Update database (current : ${configObj.db.database}):`, (database) => {
              if(database != '') configObj.db.database = database
              configDb(name)
            })
          }else{

            configProps(name)

          }

        });
      }

  }
  return{
    config : config
  }
})()


const config = (function(){
  const modules = [
    { label : 'Create', name : '-c', module : create },
    { label : 'Update', name : '-u', module : update }
  ]

  return {
    modules : modules
  }
})()

const application = (function(){
  const run = ( endpoint ) => {
    if( !endpoint ) {
      endpoint = process.argv

    }
    if( isNode ) endpoint = endpoint.slice(2)
    let name = endpoint[0],
    action = endpoint[1],
    args = endpoint[2]

    for( let module of config.modules ){
      if( module.name === name ){
        try{
          module.module[ action ]( args )
        }catch( error ){
          console.error( `${module.module}[ ${action} ](${args}) error : ${error}` )
        }
      }
    }
  },
  endpoint = (function(){
    let endpoint
    try {
      endpoint = location.hash.slice(1).split( '/' )
    }catch(error){
      endpoint = process.argv
    }
    return endpoint
  })(),
  isNode = (() => endpoint[0].includes( 'node' ))()
  let path = endpoint[1].split('\\')
  let pos = path.length-1

  if( isNode ){
    //const minimist = require('minimist')
    console.log('REST API Tool 1.4.2')
    if( endpoint[2] ){
      run()
    }else{
      console.log( 'Please choose a module & method to run;' )
      for( let module of config.modules ){

        for( let method of Object.getOwnPropertyNames( module.module ) ){
          console.log( `${module.label} : node ${path[pos]} ${module.name} ${method}` )
        }

      }
      rl.close();
    }
  }else{
    const output = document.querySelector( '#output' )
  }
  return {
    run : run,
    endpoint : endpoint,
    isNode : isNode
  }
})()
