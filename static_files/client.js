function login(values, log) {
	$.ajax({
		method: "GET",
		url: "/api/login/user/" + values.user + "/pass/" + values.pass
	}).done(function(data) {
		console.log(JSON.stringify(data));
		console.log("Login success!");
		log(true, data);
	}).fail(function(err) {
		console.log(err.status);
		console.log(JSON.stringify(err.responseJSON));
		console.log("Login error!");
		log(false, "");
	});
}

function retrieveUserInfo(data, ret) {
	$.ajax({
		method: "GET",
		url: "/api/information/user/" + data.user + "/password/" + data.pass
	}).done(function(data) {
		console.log("Information successfully retrieved !");
		ret(true, data);
	}).fail(function(err) {
		console.log("Information retrival failed!");
		ret(false, "");
	});
}

function register(values, reg) {
	$.ajax({
		method: "POST",
		url: "/api/register/",
		data: {
			user: values.user,
			pass: values.pass,
			email: values.email,
			birth: values.birthday,
			year: values.year,
			lecture: values.lecture
		}
	}).done(function(data) {
		console.log("Registered successfully!");
		reg(true);
	}).fail(function(err) {
		console.log(err.status);
		console.log(JSON.stringify(err.responseJSON));
		console.log("Register error!");
		reg(false);
	});
}

function updateProfile(values, upd) {
	$.ajax({
		method: "PUT",
		url: "/api/update/user/" + values.user,
		data: {
			pass: values.pass,
			email: values.email,
			birthday: values.birthday,
			year: values.year,
			lecture: values.lecture
		}
	}).done(function(data, text_status, jqXHR) {
		console.log(JSON.stringify(data));
		console.log(text_status);
		console.log(jqXHR.status);
		console.log("Updated successfully!");
		upd(true);
	}).fail(function(err) {
		console.log(err.status);
		console.log(JSON.stringify(err.responseJSON));
		console.log("Update error!");
		upd(false);
	});
}

function verifyPassword(values, del) {
	$.ajax({
		method: "GET",
		url: "/api/verifyPassword/user/" + values.user + "/pass/" + values.pass
	}).done(function(data) {
		deleteAccount(values.user);
		del(true);
	}).fail(function(err) {
		console.log(err.status);
		console.log(JSON.stringify(err.responseJSON));
		del(false);
	});
}

function deleteAccount(user) {
	$.ajax({
		method: "DELETE",
		url: "/api/deleteAccount/user/" + user
	}).done(function(data) {
		console.log("Deleted successfully!");
	}).fail(function(err) {
		console.log("Delete error!");
	});
}

function retrieveTopTen(ret) {
	$.ajax({
		method: "GET",
		url: "/api/topten"
	}).done(function(data) {
		var highScores = [];
		for(i=0;i<data["scores"].length;i++){
			highScores.push(data["scores"][i].username + " : " + data["scores"][i].score);
		}
		console.log("Top10 success!");
		ret(true, highScores);
	}).fail(function(err) {
		console.log("Top10 error!");
		ret(false, "");
	});
}

function updateScore(data, switchScreen) {
	$.ajax({
		method: "PUT",
		url: "/api/updateScore/user/" + data.user,
		data: {
			pass: data.pass,
			score: data.score
		}
	}).done(function(data, text_status, jqXHR) {
		console.log(JSON.stringify(data));
		console.log(text_status);
		console.log(jqXHR.status);
        switchScreen();
	}).fail(function(err) {
		console.log(err.status);
		console.log(JSON.stringify(err.responseJSON));
        switchScreen();
	});
}