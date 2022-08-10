const Sequelize = require('sequelize');
const express = require('express');
const app = express();

const db = new Sequelize('postgres://localhost/acme_people_places_things', {logging: false});

const Person = db.define('person', {
    name: {
        type: Sequelize.STRING, 
        validate: { notEmpty: true}, 
        unique: true
    }
});

const Place = db.define('place', {
    name: {
        type: Sequelize.STRING,
        validate: { notEmpty: true}, 
        unique: true
    }
});

const Thing = db.define('thing', {
    name: {
        type: Sequelize.STRING,
        validate: { notEmpty: true}, 
        unique: true
    }
});

const Souvenir = db.define('souvenir', {
    personId: {
        type: Sequelize.INTEGER, 
        // allowNull: false
    }, 
    placeId: {
        type: Sequelize.INTEGER, 
        // allowNull: false
    },
    thingId: {
        type: Sequelize.INTEGER, 
        // allowNull: false
    }
})

Souvenir.belongsTo(Person);
Person.hasMany(Souvenir);
Souvenir.belongsTo(Place);
Place.hasMany(Souvenir);
Souvenir.belongsTo(Thing);
Thing.hasMany(Souvenir);


app.get('/', async(req, res, next)=>{
    const people = await Person.findAll();
    const places = await Place.findAll();
    const things = await Thing.findAll();
    const souvenirs = await Souvenir.findAll({
        include: [Person, Place, Thing]
    });
    console.log(souvenirs);
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Document</title>
        </head>
        <body>
            <h2>People</h2>
                <ul>
                    ${people.map(person => {
                        return `<li>${person.name}</li>`
                    }).join('')}
                </ul>
            <h2>Places</h2>
                <ul>
                    ${places.map(place => {
                        return `<li>${place.name}</li>`
                    }).join('')}
                </ul>  
            <h2>Things</h2>
                <ul>
                    ${things.map(thing => {
                        return `<li>${thing.name}</li>`
                    }).join('')}
                </ul>  
            <h2>Souvenir Purchases</h2>
                <ul>
                    ${souvenirs.map(souvenir => {
                        return`<li>${souvenir.personId} puchased...</li>`
                    }).join('')}
                </ul>        
        </body>
        </html>
    `)
})

const init = async()=>{
    try{
       await db.sync({force: true});

       const [moe, larry, lucy, ehtyl, paris, nyc, chicago, london, hat, shirt, bag, cup] = await Promise.all([
        Person.create({name: 'moe'}),
        Person.create({name: 'larry'}),
        Person.create({name: 'lucy'}), 
        Person.create({name: 'ethyl'}),
        Place.create({name: 'paris'}),
        Place.create({name: 'NYC'}),
        Place.create({name: 'Chicago'}), 
        Place.create({name: 'London'}),
        Thing.create({name: 'hat'}),
        Thing.create({name: 'shirt'}),
        Thing.create({name: 'bag'}), 
        Thing.create({name: 'cup'})
       ]); 
       console.log( await Person.findAll());

       await Promise.all([
            Souvenir.create({personId: moe.id, placeId: london.id, thingId: hat.id}), 
            Souvenir.create({personId: larry.id, placeId: nyc.id, thingId: shirt.id}), 
            Souvenir.create({personId: ehtyl.id, placeId: paris.id, thingId: bag.id})
        ]);

       const port = process.env.PORT || 3000
       app.listen(port, ()=> console.log(`listening on port ${port}`));
    }

    catch(ex){
        console.log(ex)
    }
}

init();