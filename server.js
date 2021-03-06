const express = require('express');
const app = express();
const geolib = require('geolib');

const bodyParser = require('body-parser');
const port = 3300; //porta padrão
const { Pool, Client } = require('pg')
const connectionString = 'postgresql://postgres:suasenha@localhost:5432/trabalho_sd'
const pool = new Client({
  connectionString: connectionString,
})

pool.connect()



//configurando o body parser para pegar POSTS mais tarde
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());





//definindo as rotas
const router = express.Router();
router.get('/', (req, res) => res.json({ message: 'Funcionando!' }));
app.use('/', router); // requisições que chegam na raiz devem ser enviadas para o router

router.get('/users', (req, response) =>{
  pool.query('SELECT * FROM users', (err, res) => {
    // pool.end()
    response.json(res.rows)

  })

})

router.delete('/deleteUsers/:id', (req, response) =>{
  const id = parseInt(req.params.id);
  pool.query(`DELETE FROM users where id=${id}`, (err, res) => {
    pool.end()
    response.json(res.rows)

  })

})

router.post('/createRequest', (req, response) => {
  const user_id = req.body.userId;
  const name = req.body.nome;
  const cnpj = req.body.cnpj;
  const area = parseInt(req.body.area);
  const endereco = req.body.endereco;
  const maxQnt = parseInt(req.body.maxQnt);

  const text = `INSERT INTO public.requests (user_id, name, cnpj, area, endereco, max_qnt) 
                VALUES ('${user_id}', '${name}', '${cnpj}', '${area}', '${endereco}', '${maxQnt}')`

  console.log(req.body)
  pool.query(text, (err, res) => {
    response.json(res)
    if(err){
      console.log(err)
    }

  })
})

router.post('/editProfile', (req, response) => {
  const user_id = req.body.userId;
  const name = req.body.name;
  const cpf = req.body.cpf;
  const phone = req.body.phone;
  const email = req.body.email;
  const password = req.body.password;

  const text = `UPDATE users SET name = '${name}', cpf = '${cpf}', telefone = '${phone}', email = '${email}', password = '${password}' WHERE user_id = ${user_id}`
  console.log(text)
  pool.query(text, (err, res) => {
    response.json(res)
    if(err){
      console.log(err)
    }

  })
})

router.patch('/place/:id', (req, response) =>{
  const id = req.params.id
  const name = req.body.name;
  const cnpj = req.body.cnpj;
  const area = parseInt(req.body.area);
  const max_qnt = parseInt(req.body.max_qnt);
  const lat = req.body.lat;
  const long = req.body.long;
  const endereco = req.body.endereco

console.log(`UPDATE places SET name='${name}',cnpj='${cnpj}',area=${area},max_qnt='${max_qnt}', lat='${lat}', long='${long}', endereco='${endereco}' WHERE place_id=${id}`)
  pool.query(`UPDATE places SET name='${name}',cnpj='${cnpj}',area=${area},max_qnt='${max_qnt}', lat='${lat}', long='${long}', endereco='${endereco}' WHERE place_id=${id}`, (err, res) => {
      // pool.end()
      response.json(res)
      console.log(res)
    })

})


router.get('/place/:name', (req, response) =>{

  // Have to install pg_trgm: CREATE EXTENSION pg_trgm;
  pool.query(`SELECT * FROM places WHERE similarity(name, '${req.params.name.replace("_", " ")}') > 0.5`, (err, res) => {
      // pool.end()
      response.json(res.rows)
    })
    console.log("Get places")

})


router.post('/place', (req, response) =>{
  const lat = req.body.lat;
  const lon = req.body.lon;
  const name = req.body.name;
  const cnpj = req.body.cnpj;
  const area = parseInt(req.body.area);
  const max_qnt = parseInt(req.body.max_qnt);
  const endereco = req.body.endereco;

  console.log(`INSERT INTO places VALUES (name='${name}',cnpj='${cnpj}',area=${area},max_qnt='${max_qnt}', latitude='${lat}', longitude='${lon}')`)

  pool.query(`INSERT INTO places (name, cnpj, endereco, area, max_qnt, lat, long)VALUES ('${name}','${cnpj}', '${endereco}', ${area},${max_qnt}, '${lat}', '${lon}')`, (err, res) => {

      response.json(res)

      if(err){
        console.log(err)
      }

    })
    console.log("Post place")

})


router.get('/favourites/:id', (req, response) =>{

  pool.query(`select * from places join favourites on (places.place_id = favourites.place_id) where user_id = '${req.params.id}'`, (err, res) => {

    if(res.rows){
      response.json(res.rows)
    }
  

})
console.log("Get favourites")

    })

router.get('/allRequests', (req, response) =>{
  pool.query(`SELECT r.name as name, r.cnpj as cnpj, u.name as username, u.user_id as user_id, r.area as area, r.endereco, r.max_qnt, r.place_id as place_id
  FROM requests r join users u on u.user_id = r.user_id`, (err, res) => {
      response.json(res.rows)
    })
    console.log("Get places")

})

router.get('/allPlaces', (req, response) =>{
  pool.query(`SELECT place_id, name, cnpj, area, endereco, max_qnt, lat, long FROM places`, (err, res) => {
      response.json(res.rows)
    })
})

router.delete('/request/:user_id&:place_id', (req, response) =>{
  const user_id = req.params.user_id;
  const place_id = req.params.place_id;

  pool.query(`DELETE from requests where ( user_id = '${user_id}' and place_id = '${place_id}')`, (err, res) => {
      response.json(res.rows)
      if(err){
        console.log(err)
      }
    })

    console.log("Delete request")

})

router.delete('/place/:place_id', (req, response) =>{
  const place_id = req.params.place_id;

  pool.query(`DELETE from places where ( place_id = '${place_id}')`, (err, res) => {
      response.json(res)
      if(err){
        console.log(err)
      }
    })

    console.log("Delete place")

})

router.post('/request', (req, response) =>{
  const id = parseInt(req.params.id);
  console.log(req.body.name)
  const user_id = req.body.user;
  const name = req.body.name;
  const cnpj = req.body.cnpj;
  const area = parseInt(req.body.area);
  const max_qnt = req.body.max_qnt;
  console.log(name)

  pool.query(`INSERT INTO requests VALUES (id=${id}, user_id='${user_id}', name='${name}',cnpj='${cnpj}',area=${area},max_qnt=${max_qnt})`, (err, res) => {

      // pool.end()
      response.json(res.rows)

    })
    console.log("Get favourites")

})

router.get('/favourite/:user_id&:place_id', (req, response) =>{
  const user_id = req.params.user_id;
  const place_id = req.params.place_id;

  pool.query(`select * from favourites where ( user_id = '${user_id}' and place_id = '${place_id}')`, (err, res) => {
      response.json(res.rows)
      if(err){
        console.log(err)
      }
    })

    console.log("Get favourite")

})

router.post('/favourite', (req, response) => {
  const user_id = req.body.user_id;
  const place_id = req.body.place_id;

  const text = `INSERT INTO public.favourites (user_id, place_id) 
                VALUES ('${user_id}', '${place_id}')`

  console.log(req.body)
  pool.query(text, (err, res) => {
    response.json(res)
    if(err){
      console.log(err)
    }

  })

  console.log("Post favourite")
})


router.delete('/favourite/:user_id&:place_id', (req, response) =>{
  const user_id = req.params.user_id;
  const place_id = req.params.place_id;

  pool.query(`DELETE from favourites where ( user_id = '${user_id}' and place_id = '${place_id}')`, (err, res) => {
      response.json(res.rows)
      if(err){
        console.log(err)
      }
    })

    console.log("Delete favourite")

})


router.post('/login', (req, response) => {
  const email = req.body.email
  const senha = req.body.senha
  const text = `SELECT * FROM public.users WHERE email ='${email}' and password='${senha}' `


  pool.query(text, (err, res) => {
    response.json(res.rows)
    console.log("Login")

  })
})

router.post('/createUser', (req, response) => {
  const nome = req.body.nome
  const cpf = req.body.cpf
  const telefone = req.body.telefone
  const email = req.body.email
  const senha = req.body.senha

  const text = `INSERT INTO public.users(
    name, cpf, telefone, email, password)
    VALUES ('${nome}', '${cpf}', '${telefone}', '${email}', '${senha}')`

  pool.query(text, (err, res) => {
    response.json(res)
  })
})

router.post('/sendLocation', (req, response) => {

  const id = req.body.user_id
  const lat = req.body.lat
  const long = req.body.long

  const text = `UPDATE public.users SET lat = ${lat}, long = ${long} WHERE user_id = ${id}`
  console.log(text);
  pool.query(text, (err, res) => {
    response.json(res)
  })


})


router.get('/placeStatus/:placeId', (req, response) => {
  console.log("Bateu")
  count = 0
  placeId = req.params.placeId

  pool.query(`select lat as latitude,long as longitude from users`, (err, res) => {
    coord_users = res.rows

    pool.query(`select max_qnt, area, lat as latitude, long as longitude from places where place_id = '${placeId}'`, (err, res) => {
      place_coord = res.rows[0]
      console.log(place_coord)

      for (i=0; i<coord_users.length; i++){
        console.log(coord_users[i])
        if(coord_users[i].latitude !== null && coord_users[i].longitude !== null){

          isInside = geolib.isPointWithinRadius(
            {latitude: parseFloat(coord_users[i].latitude), longitude: parseFloat(coord_users[i].longitude)},
            {latitude: parseFloat(place_coord.latitude), longitude: parseFloat(place_coord.longitude)},
            Math.sqrt(2*parseFloat(place_coord.area))/2
          )

          if(isInside){
            count++
          }
        }
      }
      console.log(count)

      area = parseFloat(place_coord.area)
      if(area <= 50){
        porte = 'Pequeno'
      }
      else if( area > 50 && area <=100){
        porte = 'Médio'
      }
      else if( area > 100){
        porte = 'Grande'
      }
      console.log('poete: ' + porte)

      rate = parseFloat(count)/parseFloat(place_coord.max_qnt)
      if (rate <= 0.3)
        lotacao = 'Vazio'

      else if (rate > 0.3 && rate <= 0.6)
        lotacao = 'Moderado'

      else if (rate > 0.6 && rate <= 0.9)
        lotacao = 'Cheio'

      else if (rate > 0.9)
        lotacao = 'Lotado'


      response.json({
        lotacao: lotacao,
        porte: porte,
        qnt_max: place_coord.max_qnt,

      })
    })
  })
})


//inicia o servidor

app.listen(port);

console.log('API funcionando!');
