var App = Ember.Application.create({
	LOG_TRANSITIONS: true
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
	userName: 'Michael',
	logo: 'images/logo.png',
	time: function() {
		return (new Date()).toDateString();
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
			contact.save().then(function(contact){
				var body = 'name=' + contact.get('userName') + '\n' +
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
	createdAt: DS.attr('date')
});

App.User = DS.Model.extend({
	userName: DS.attr('string'),
	description: DS.attr('string'),
	confirm: DS.attr('boolean'),
	major: DS.attr('boolean'),
	createdAt: DS.attr('date'),
	articles: DS.hasMany('articles', {async: true})
});

App.Articles = DS.Model.extend({
	title: DS.attr('string'),
	intro: DS.attr('string'),
	text: DS.attr('string'),
	createdAt: DS.attr('date'),
	author: DS.belongsTo('user', {async: true})
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
	title: 'titre1',
	intro: 'intro1',
	text: 'texte1',
	createdAt: new Date('January 22, 2014 11:23:00'),
	author: 1
},
{
	id: 2,
	title: 'titre2',
	intro: 'intro2',
	text: 'texte2',
	createdAt: new Date('January 23, 2014 11:23:00'),
	author: 1
}
];
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
