// Cr�ation de l'application emberJS
var App = Ember.Application.create({
	LOG_TRANSITIONS: true
});

// D�claration du syst�me de gestion des mod�les
App.ApplicationAdapter = DS.FixtureAdapter.extend();

// Set de la langue de l'Horloge 
moment.lang('fr');

// cr�ation d'un objet clock et initialisation d'un compteur
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

// Initialisation des composant au d�marrage de l'application
Ember.Application.initializer({
	name: 'clockServiceInitializer',
	initialize: function(container, application) {
		container.register('clock:service', ClockService);
		application.inject('controller:agenda', 'clock', 'clock:service');
		application.inject('controller:index', 'clock', 'clock:service');
	}
});

// Horloge
Ember.Handlebars.registerBoundHelper('digital_clock', function(secondsCounter, TimeSource) {
	var timeSrc = (new Date(TimeSource)).getTime();
	var timeNow = (new Date()).getTime()
	var timeDiff = moment().format('dddd D MMMM YYYY HH:mm:ss');
    return new Ember.Handlebars.SafeString(timeDiff);
});

// Compte � rebours
Ember.Handlebars.registerBoundHelper('digital_countdown', function(secondsCounter, TimeSource) {
	var timeSrc = (new Date(TimeSource)).getTime();
	var timeNow = (new Date()).getTime();
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

// Routage g�n�ral
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

// Routage des agendas
App.AgendasRoute = Ember.Route.extend({
	model: function(params) {
		return this.store.findAll('agendas');
	}
});

// Routage d'un agenda
App.AgendaRoute = Ember.Route.extend({
	model: function(params) {
	  	return this.store.find('agendas', params.agendas_id);
	}
});

// Routage des articles
App.ArticlesRoute = Ember.Route.extend({
	model: function(params) {
		return this.store.findAll('articles');
	}
});

// Routage d'un article
App.ArticleRoute = Ember.Route.extend({
	model: function(params) {
	  	return this.store.find('articles', params.articles_id);
	}
});

// Contr�leur des agendas
App.AgendasController = Ember.ArrayController.extend({
	sortProperties: ['date'],
	sortAscending: true
});

// Contr�leur des articles
App.ArticlesController = Ember.ArrayController.extend({
	sortProperties: ['createdAt'],
	sortAscending: false
});

// Contr�leur de l'agenda comprenant le compte � rebours
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

// Contr�leur de la page index
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
		return new Date();//moment().format('LLL');
	}.property(),
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

// Contr�leur de la page de contact permettant d'envoyer un mail
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

// Contr�leur de la page d'enregistrement permettant d'envoyer un mail
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

// Cr�ation d'un objet permettant l'affichage d'un control vid�o
App.videoController = Ember.Object.create({
    //src: "http://media.w3.org/2010/05/bunny/trailer.mp4",
    src: "medias/trailer.mp4",

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

// Affichage d'une vid�o
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

// Affichage de l'application
App.ApplicationView = Ember.View.extend({
	didInsertElement: function() {
		cookieManager();
	}
});

// Function dropdown de la bar de menu
$('.dropdown-toggle').dropdown();

/// Mod�les

// Mod�le de contact
App.Contact = DS.Model.extend({
	userName: DS.attr('string'),
	email: DS.attr('string'),
	message: DS.attr('string'),
	createdAt: DS.attr('date'),
	formattedDate: function() {
		return moment(this.get('createdAt')).format('LLL');
	}.property()
});

// Mod�le d'utilisateur
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

// Mod�le d'article
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

// Mod�le d'agenda
App.Agendas = DS.Model.extend({
	title: DS.attr('string'),
	description :DS.attr('string'),
	date: DS.attr('date'),
	image: DS.attr('string'),
	formattedDate: function() {
		return moment(this.get('date')).format('LLL');
	}.property()
});

/// Donn�es

// Donn�es utilisateurs
App.User.FIXTURES = [
{
	id: 1,
	userName: 'Michael Silvestre',
	description: '',
	confirm: true,
	major: true,
	createdAt: new Date('January 22, 1976 06:30:00'),
	articles: [1,2]
},
{
	id: 2,
	userName: 'C�line Zoetardt',
	description: '',
	confirm: true,
	major: true,
	createdAt: new Date('May 16, 1982 12:30:00'),
	articles: [3]
}
];

// Donn�es articles
App.Articles.FIXTURES = [
{
	id: 1,
	title: 'StarWars',
	intro: "Star Wars (� l'origine nomm�e en France et au Qu�bec sous son titre fran�ais, La Guerre des �toiles) est une �pop�e cin�matographique de science-fiction cr��e par George Lucas en 1977. D'abord con�ue comme une trilogie sortie entre 1977 et 1983, la saga s'est ensuite �largie de trois films sortis entre 1999 et 2005 racontant des �v�nements ant�rieurs aux premiers. Tous ont connu un grand succ�s commercial et la premi�re trilogie (�pisodes IV, V et VI) a re�u un accueil critique tr�s positif, qui ne sera n�anmoins pas autant au rendez-vous pour la deuxi�me trilogie (�pisodes I, II et III).",
	text: "Star Wars (� l'origine nomm�e en France et au Qu�bec sous son titre fran�ais, La Guerre des �toiles) est une �pop�e cin�matographique de science-fiction cr��e par George Lucas en 1977. D'abord con�ue comme une trilogie sortie entre 1977 et 1983, la saga s'est ensuite �largie de trois films sortis entre 1999 et 2005 racontant des �v�nements ant�rieurs aux premiers. Tous ont connu un grand succ�s commercial et la premi�re trilogie (�pisodes IV, V et VI) a re�u un accueil critique tr�s positif, qui ne sera n�anmoins pas autant au rendez-vous pour la deuxi�me trilogie (�pisodes I, II et III). Dans un souci de coh�rence et pour atteindre un r�sultat qu'il n'avait pas pu obtenir d�s le d�part, le cr�ateur de la saga a �galement retravaill� les films de sa premi�re trilogie, ressortis en 1997 et 2004 dans de nouvelles versions. Les droits d'auteur de Star Wars ont �t� achet�s en octobre 2012 par la Walt Disney Company pour un peu plus de 4 milliards de dollars, la sortie au cin�ma du VIIe �pisode de l'�pop�e est alors planifi�e pour 2015.\n Encore une fois il va falloir emp�cher le Conte Dooku de convainqure Anakin de basculer du c�t� obscure de la force.",
	createdAt: new Date('March 12, 2014 14:23:00'),
	author: 1
},
{
	id: 2,
	title: 'Le Seigneur des Anneaux',
	intro: "L'histoire reprend certains des personnages pr�sent�s dans Le Hobbit, premier roman de l'auteur paru en 1937, mais l'�uvre est plus complexe et plus sombre. Tolkien entreprend sa r�daction � la demande de son �diteur, Allen & Unwin, � la suite du succ�s critique et commercial du Hobbit1. Il lui faut douze ans pour parvenir � achever ce nouveau roman qu'il truffe de r�f�rences et d'allusions au monde du Silmarillion, la Terre du Milieu, sur lequel il travaille depuis 1917 et dans lequel Le Hobbit a �t� attir� � contre l'intention premi�re � de son auteur",
	text: "L'histoire reprend certains des personnages pr�sent�s dans Le Hobbit, premier roman de l'auteur paru en 1937, mais l'�uvre est plus complexe et plus sombre. Tolkien entreprend sa r�daction � la demande de son �diteur, Allen & Unwin, � la suite du succ�s critique et commercial du Hobbit1. Il lui faut douze ans pour parvenir � achever ce nouveau roman qu'il truffe de r�f�rences et d'allusions au monde du Silmarillion, la Terre du Milieu, sur lequel il travaille depuis 1917 et dans lequel Le Hobbit a �t� attir� � contre l'intention premi�re � de son auteur. \n\nVous prendrez part dans le role que vous d�sirez et deviendrez peut-�tre le sauveur de la terre du milieu.",
	createdAt: new Date('April 3, 2014 09:03:00'),
	author: 1
},
{
	id: 3,
	title: 'Star Trek',
	intro: "Star Trek est un univers de science-fiction, cr�� par Gene Roddenberry, dans les ann�es 1960, qui regroupe six s�ries t�l�vis�es, douze longs m�trages, des centaines de romans, de bandes dessin�es et des dizaines de jeux vid�o, ainsi qu�une fanfiction importante. Elle est, de mani�re plus prosa�que, une franchise de t�l�vision et de cin�ma appartenant � Paramount Pictures, propri�t� de la compagnie CBS",
	text: "Star Trek est un univers de science-fiction, cr�� par Gene Roddenberry, dans les ann�es 1960, qui regroupe six s�ries t�l�vis�es, douze longs m�trages, des centaines de romans, de bandes dessin�es et des dizaines de jeux vid�o, ainsi qu�une fanfiction importante. Elle est, de mani�re plus prosa�que, une franchise de t�l�vision et de cin�ma appartenant � Paramount Pictures, propri�t� de la compagnie CBS.\n\nDans l'univers Star Trek, l'humanit� d�veloppe le voyage spatial � vitesse supraluminique, via un sub-espace artificiel, suite � une p�riode post-apocalyptique du milieu du xxie si�cle (voir le Jour du Premier Contact). Plus tard, l'homme s'unit � d'autres esp�ces intelligentes de la galaxie pour former la F�d�ration des plan�tes unies. � la suite d'une intervention extraterrestre, et gr�ce � la science, l'humanit� surmonte largement ses nombreux vices et faiblesses terrestres, au xxiiie si�cle. Les histoires de Star Trek d�peignent souvent les aventures d'�tres humains et d'esp�ces extra-terrestres qui servent dans Starfleet, ainsi que les nombreux contacts de ceux-ci avec d'autres civilisations.",
	createdAt: new Date('January 23, 2014 11:45:00'),
	author: 2
}
];

// Donn�es agendas
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
	description:'Reconstitution de : La col�re de Khan avec d�cors grandeur nature',
	date: new Date('May 29, 2014 14:43:00'),
	image:'images/startrek/StarTrekCast.jpg'
},
{
	id: 3,
	title:'Seigneur des anneaux',
	description:'Aidez Aragone a combattre Saroumane et reconqu�rir la terre du milieu!',
	date: new Date('Aprix 29, 2014 18:52:00'),
	image:'images/lordsrings/SEIGNEUR_ANNEAUX.jpg'
}
];


// Gestionnaire de cookies et du local storage si on utilise Chrome
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

// Instanciation du gestionnaire de cookies
var cookies = new Cookies();

// Gestionnaire de feuilles de style (css)
var cookieManager = function(){
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
        return false;
    });
};
