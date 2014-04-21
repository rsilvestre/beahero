var App = Ember.Application.create({
	LOG_TRANSITIONS: true
});

moment.lang('fr');

var ClockService = Ember.Object.extend({
    pulse: Ember.computed.oneWay('_seconds').readOnly(),
    tick: function () {
		var clock = this;
		Ember.run.later(function () {
			var seconds = clock.get('_seconds');
			if (typeof seconds === 'number') {
				clock.set('_seconds', seconds + (1/4));
			}
		}, 250);
	}.observes('_seconds').on('init'),
	_seconds: 0
});

Ember.Application.initializer({
	name: 'clockServiceInitializer',
	initialize: function(container, application) {
		container.register('clock:service', ClockService);
		application.inject('controller:agenda', 'clock', 'clock:service');
	}
});

Ember.Handlebars.helper('mailToHelper', function(email, options) {
	var mailTo = '<a target="_blank" href="mailto:' + email + '">';
	mailTo += "<span>" + email + "</span></a>";
	return new Handlebars.SafeString(mailTo);
});

App.ApplicationAdapter = DS.FixtureAdapter.extend();

App.Router.map(function() {
	this.route('about');
	this.resource('articles');
	this.resource('article', {path: 'article/:articles_id'});
	this.route('tariff');
	this.route('media');
	this.route('credits', {path: 'thanks'});
	this.route('register');
	this.route('contact');
	this.resource('agendas');
	this.resource('agenda', {path: 'agenda/:agendas_id'});
});

Ember.Handlebars.registerBoundHelper('digital_clock', function(secondsCounter, toto) {
	var timeSrc = (new Date(toto)).getTime();
	var timeNow = (new Date()).getTime()
	var timeDiff = moment.duration(timeSrc - timeNow - secondsCounter , 'milliseconds');
	var months = timeDiff.months();
	var days = timeDiff.days();
    var hours = timeDiff.hours();
    var minutes = timeDiff.minutes();
    var seconds = timeDiff.seconds();
    var addZero = function (number) {
    	return (number < 10) ? '0' + number : '' + number;
    };
    var formatHMS = function(mo, d, h, m, s) {
    	if (mo > 0) {
    		return '%@ m, %@ j, %@:%@:%@'.fmt(mo, d, h, addZero(m), addZero(s));
    	} else if (d > 0) {
			return '%@ j, %@:%@:%@'.fmt(d, h, addZero(m), addZero(s));
		} else if (h > 0) {
			return '%@:%@:%@'.fmt(h, addZero(m), addZero(s));
		} else {
			return '%@:%@'.fmt(m, addZero(s));
		}
    };
    return new Ember.Handlebars.SafeString(formatHMS(months, days, hours, minutes, seconds));
});

App.AgendaController = Ember.ObjectController.extend({
    secondsBinding: 'clock.pulse',
    fullSecond: function () {
		return (this.get('seconds') % 1 === 0);
    }.property('seconds'),
    quarterSecond: function () {
		return (this.get('seconds') % 1 === 1/4);
    }.property('seconds'),
    halfSecond: function () {
		return (this.get('seconds') % 1 === 1/2);
    }.property('seconds'),
    threeQuarterSecond: function () {
		return (this.get('seconds') % 1 === 3/4);
    }.property('seconds')
});

App.AgendasRoute = Ember.Route.extend({
	model: function(params) {
		return this.store.findAll('agendas');
	}
});

App.AgendaRoute = Ember.Route.extend({
	model: function(params) {
	  	return this.store.find('agendas', params.agendas_id);
	}
});

App.ArticlesRoute = Ember.Route.extend({
	model: function(params) {
		return this.store.findAll('articles');
	}
});

App.ArticleRoute = Ember.Route.extend({
	model: function(params) {
	  	return this.store.find('articles', params.articles_id);
	}
});

App.IndexController = Ember.ArrayController.extend({
	userName: function() {
		var name = cookies.readCookie("name")
		if (name) {
			return name + ' content de vous revoir.';
		}
		return ' et bienvenu sur le site de Be a Hero!';
	}.property(),
	logo: 'images/logo.png',
	time: function() {
		return moment().format('LLL');
	}.property()
});

App.ContactController = Ember.ObjectController.extend({
	userName: '',
	email: '',
	message: '',
	thankyou: null,
	userNameValue: 'Enter name',
	emailValue: 'Enter your email',
	messageValue: 'Enter your message',
	alert:'',
	actions: {
		createContact: function() {
			console.dir('Create Contact');
			if (this.get('userName') == '' || this.get('email') == '') {
				this.set('alert', 'Veuillez remplir les champs requis');
				return;
			}
			var contact = this.store.createRecord('contact', {
				userName: this.get('userName'),
				email: this.get('email'),
				message: this.get('message'),
				createdAt: new Date()
			});
			var controller = this;
			contact.save().then(function(contact){				var body = 'name=' + contact.get('userName') + '\n' +
						'email=' + contact.get('email') + '\n' +
						'message=' + contact.get('message');

				location.href = 'mailto:' + encodeURIComponent('message@flint-flame.com') +
				'?subject=' + encodeURIComponent('Contact') +
				'&body=' + encodeURIComponent(body);

				controller.set('thankyou', 'Thank you for this email');
			});

		}
	}
});

App.RegisterController = Ember.ObjectController.extend({
	userName: '',
	description: '',
	confirm: function(key, value) {
        if (arguments.length == 2) {
            this.set('confirmCheckbox', !value);
        }
        return !(this.get('confirmCheckbox'));
    }.property('confirm'),
	major: function(key, value) {
        if (arguments.length == 2) {
            this.set('majorCheckbox', !value);
        }
        return !(this.get('majorCheckbox'));
    }.property('major'),
	thankyou: null,
	confirmCheckbox:true,
	majorCheckbox:true,
	userNameValue: 'Enter name',
	descriptionValue: 'Enter description',
	alert:'',
	actions: {
		createUser: function() {
			console.dir('Create User');
			if (this.get('userName') == '' || this.get('description') == '') {
				this.set('alert', 'Veuillez remplir les champs requis');
				return;
			}
			var user = this.store.createRecord('user', {
				userName: this.get('userName'),
				description: this.get('description'),
				confirm: this.get('confirm'),
				major: this.get('major'),
				createdAt: new Date()
			});
			var controller = this;
			user.save().then(function(user){
				//controller.get('model.register').addObject(user);
				//controller.get('userName');
				cookies.createCookie('name', user.get('userName'), 365);

				var body = 'name=' + user.get('userName') + '\n' +
						'description=' + user.get('description') + '\n' +
						'confirm=' + user.get('confirm') + '\n' +
						'major=' + user.get('major');

				location.href = 'mailto:' + encodeURIComponent('register@flint-flame.com') +
				'?subject=' + encodeURIComponent('register') +
				'&body=' + encodeURIComponent(body);

				//controller.set('userName', '');
				controller.set('thankyou', 'Thank you for this email');
			});

		}
	}
});

App.videoController = Ember.Object.create({
    src: "http://media.w3.org/2010/05/bunny/trailer.mp4",

    currentTimeFormatted: function() {
        var currentTime = this.get('currentTime');
        if (currentTime) {
            currentTime = Math.floor(currentTime);
        } else {
            currentTime = 0;
        }
        return '%@s'.fmt(currentTime);
    }.property('currentTime')
});

App.Video = Ember.View.extend({
    srcBinding: 'controller.src',
    controls: true,
    tagName: 'video',
    attributeBindings: 'src poster controls width height'.w(),

    didInsertElement: function() {
        this.$().on("timeupdate", {
            element: this
        }, this.timeupdateDidChange);
    },

    timeupdateDidChange: function(evt) {
        var video = evt.data.element;
        var currentTime = evt.target.currentTime;
        video.setPath('controller.currentTime', currentTime);
    }
});

App.Contact = DS.Model.extend({
	userName: DS.attr('string'),
	email: DS.attr('string'),
	message: DS.attr('string'),
	createdAt: DS.attr('date'),
	formattedDate: function() {
		return moment(this.get('createdAt')).format('LLL');
	}.property()
});

App.User = DS.Model.extend({
	userName: DS.attr('string'),
	description: DS.attr('string'),
	confirm: DS.attr('boolean'),
	major: DS.attr('boolean'),
	createdAt: DS.attr('date'),
	articles: DS.hasMany('articles', {async: true}),
	formattedDate: function() {
		return moment(this.get('createdAt')).format('LLL');
	}.property()
});

App.Articles = DS.Model.extend({
	title: DS.attr('string'),
	intro: DS.attr('string'),
	text: DS.attr('string'),
	createdAt: DS.attr('date'),
	author: DS.belongsTo('user', {async: true}),
	formattedDate: function() {
		return moment(this.get('createdAt')).format('LLL');
	}.property()
});

App.Agendas = DS.Model.extend({
	title: DS.attr('string'),
	description :DS.attr('string'),
	date: DS.attr('date'),
	image: DS.attr('string'),
	formattedDate: function() {
		return moment(this.get('date')).format('LLL');
	}.property()
});

$('.dropdown-toggle').dropdown();

App.User.FIXTURES = [
{
	id: 1,
	userName: 'Michael Silvestre',
	description: '',
	confirm: true,
	major: true,
	createdAt: new Date('January 22, 1976 07:30:00'),
	articles: [1,2]
}
];

App.Articles.FIXTURES = [
{
	id: 1,
	title: 'StarWars',
	intro: "Star Wars (à l'origine nommée en France et au Québec sous son titre français, La Guerre des étoiles) est une épopée cinématographique de science-fiction créée par George Lucas en 1977. D'abord conçue comme une trilogie sortie entre 1977 et 1983, la saga s'est ensuite élargie de trois films sortis entre 1999 et 2005 racontant des événements antérieurs aux premiers. Tous ont connu un grand succès commercial et la première trilogie (épisodes IV, V et VI) a reçu un accueil critique très positif, qui ne sera néanmoins pas autant au rendez-vous pour la deuxième trilogie (épisodes I, II et III).",
	text: "Star Wars (à l'origine nommée en France et au Québec sous son titre français, La Guerre des étoiles) est une épopée cinématographique de science-fiction créée par George Lucas en 1977. D'abord conçue comme une trilogie sortie entre 1977 et 1983, la saga s'est ensuite élargie de trois films sortis entre 1999 et 2005 racontant des événements antérieurs aux premiers. Tous ont connu un grand succès commercial et la première trilogie (épisodes IV, V et VI) a reçu un accueil critique très positif, qui ne sera néanmoins pas autant au rendez-vous pour la deuxième trilogie (épisodes I, II et III). Dans un souci de cohérence et pour atteindre un résultat qu'il n'avait pas pu obtenir dès le départ, le créateur de la saga a également retravaillé les films de sa première trilogie, ressortis en 1997 et 2004 dans de nouvelles versions. Les droits d'auteur de Star Wars ont été achetés en octobre 2012 par la Walt Disney Company pour un peu plus de 4 milliards de dollars, la sortie au cinéma du VIIe épisode de l'épopée est alors planifiée pour 2015.\n Encore une fois il va falloir empêcher le Conte Dooku de convainqure Anakin de basculer du côté obscure de la force.",
	createdAt: new Date('January 22, 2014 11:23:00'),
	author: 1
},
{
	id: 2,
	title: 'Le Seigneur des Anneaux',
	intro: "L'histoire reprend certains des personnages présentés dans Le Hobbit, premier roman de l'auteur paru en 1937, mais l'½uvre est plus complexe et plus sombre. Tolkien entreprend sa rédaction à la demande de son éditeur, Allen & Unwin, à la suite du succès critique et commercial du Hobbit1. Il lui faut douze ans pour parvenir à achever ce nouveau roman qu'il truffe de références et d'allusions au monde du Silmarillion, la Terre du Milieu, sur lequel il travaille depuis 1917 et dans lequel Le Hobbit a été attiré « contre l'intention première » de son auteur",
	text: "L'histoire reprend certains des personnages présentés dans Le Hobbit, premier roman de l'auteur paru en 1937, mais l'½uvre est plus complexe et plus sombre. Tolkien entreprend sa rédaction à la demande de son éditeur, Allen & Unwin, à la suite du succès critique et commercial du Hobbit1. Il lui faut douze ans pour parvenir à achever ce nouveau roman qu'il truffe de références et d'allusions au monde du Silmarillion, la Terre du Milieu, sur lequel il travaille depuis 1917 et dans lequel Le Hobbit a été attiré « contre l'intention première » de son auteur. \n\nVous prendrez part dans le role que vous désirez et deviendrez peut-être le sauveur de la terre du milieu.",
	createdAt: new Date('January 23, 2014 11:23:00'),
	author: 1
}
];

App.Agendas.FIXTURES = [
{
	id: 1,
	title:'Star Wars',
	description:'Rejouez Star Wars en plein air',
	date: new Date('June 23, 2014 11:23:00'),
	image:'images/starwars/star-wars.jpg'
},
{
	id: 2,
	title:'Star Trek',
	description:'Reconstitution de : La colère de Khan avec décors grandeur nature',
	date: new Date('May 29, 2014 14:43:00'),
	image:'images/startrek/StarTrekCast.jpg'
},
{
	id: 3,
	title:'Seigneur des anneaux',
	description:'Aidez Aragone a combattre Saroumane et reconquérir la terre du milieu!',
	date: new Date('Aprix 29, 2014 18:52:00'),
	image:'images/lordsrings/SEIGNEUR_ANNEAUX.jpg'
}
];

var Cookies = (function() {

	this.createCookie = function(name,value,days) {
	    if (days) {
	        var date = new Date();
	        date.setTime(date.getTime()+(days*24*60*60*1000));
	        var expires = "; expires="+date.toGMTString();
	    }
	    else var expires = "";
	    document.cookie = name+"="+value+expires+"; path=/";
	    localStorage.setItem(name, value);
	}
	
	this.readCookie = function(name) {
		if (window.chrome) {
			return localStorage.getItem(name);
		}
	    var nameEQ = name + "=";
	    var ca = document.cookie.split(';');
	    for(var i=0;i < ca.length;i++) {
	        var c = ca[i];
	        while (c.charAt(0)==' ') c = c.substring(1,c.length);
	        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	    }
	    return null;
	}
	
	this.eraseCookie = function(name) {
		localStorage.removeItem(name);
	    this.createCookie(name,"",-1);
	}
});

var cookies = new Cookies();

$(function(){
	var cookies = new Cookies();
	
    if(!cookies.readCookie('css')){
    	cookies.createCookie("css", "anakin.css", 365);
    }
    
    $('#dark-css').attr('href', 'css/' + cookies.readCookie('css'));
    
 	// <a herf="#" id="change-css" rel="file.css">Click Here</a>
    $('#change-css').on('click', function (event) {
        event.preventDefault();
        
        //var e = document.getElementById('dark-css');
        var cssResult = "";
        if (cookies.readCookie("css") == "anakin.css") {
			cssResult = "darkvador.css";
        } else {
        	cssResult = "anakin.css";
        }
        
        $('#dark-css').attr('href', 'css/' + cssResult);
        
        if(cookies.readCookie('css')){  
            cookies.eraseCookie('css');     
        }
        
        cookies.createCookie('css',cssResult,365); 
    });
});

/*
App.Router.map(function() {
  // put your routes here
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return ['red', 'yellow', 'blue'];
  }
});
*/
