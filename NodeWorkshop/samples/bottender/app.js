var builder = require('botbuilder');
var connector = new builder.ConsoleConnector().listen();
var bot = new builder.UniversalBot(connector);

var model = 'https://api.projectoxford.ai/luis/v1/application?id=03f0e18a-8175-465d-9e5f-6dc2aa17956f&subscription-key=ac296a3f4b9f44ab9910433f61f0e13d';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer]});
bot.dialog('/',dialog);

dialog.matches('PlaceOrder',[
    function(session,args,next){
        var drink = null;
        var drinkEntity = builder.EntityRecognizer.findEntity(args.entities,'Drink');
        if(drinkEntity){
            drink = session.dialogData.drink = drinkEntity.entity;
        }
        if(!drink){
            builder.Prompts.text(session,"What drink would you like to order?");
        } else {
            next();
        }
    },
    function(session,results,next){
        var drink = session.dialogData.drink;
        if(results.response){
            drink = results.response;
            session.dialogData.drink = drink;
        }
        if(drink){
            if(!session.userData.tab){
                session.userData.tab = 0;
            }
            var tab = session.userData.tab += 1;
            session.send('You got it, one %s coming up.  You now owe %s',drink,tab);  
        }
    }
]);

dialog.matches('CheckTab',[function(session,args,next){
    var tab = session.userData.tab;
    if(!tab){
        tab = 0;
    }
    session.send('You owe %s',tab);
}]);

dialog.matches('CloseTab',[function(session,args,next){
    //This is where I would actually process payment
    session.userData.tab = 0;
    session.send('All set!  Thanks!');
}]);

dialog.onDefault(builder.DialogAction.send('Not sure what you mean.  Please order a drink, check your tab, or close your tab'));

