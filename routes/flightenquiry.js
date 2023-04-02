var express = require('express')
var router = express.Router()
var upload = require('./multer')
var pool = require('./pool')
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');
router.get('/flightinterface', function (req, res) {
    var admin = JSON.parse(localStorage.getItem('ADMIN'))
    if (admin)
        res.render('flightinterface', { message: ' ' })
    else
        res.render('adminlogin', { message: ' ' })

})

router.get('/displayallflights', function (req, res) {
    var admin = JSON.parse(localStorage.getItem('ADMIN'))
    if (!admin) {
        res.render('adminlogin', { message: ' ' })
    }
    else {
         pool.query("select F.*,(select C.cityname from cities C where C.cityid = F.sourcecity)as source,(select C.cityname from cities C where C.cityid = F.destinationcity )as destination from flightdetails F", function (error, result) {
            if (error) {
                res.render('displayallflights', { data: [], message: 'server error' })
            }
            else {
                res.render('displayallflights', { data: result, message: 'success' })
            }
        })

    }
})
router.post('/flightsubmit', upload.single('logo'), function (req, res) {
    var days = (" " + req.body.days).replaceAll("'", '"')
    //console.log("BODY",req.body)
    //console.log("FILE",req.file)
    pool.query("insert into flightdetails ( flightname, types, totalseats, days, sourcecity, arrivaltime, departuretime, destinationcity, company, logo)values(?,?,?,?,?,?,?,?,?,?)", [req.body.flightname, req.body.flighttype, req.body.noofseats, days, req.body.source, req.body.arrival, req.body.departure, req.body.destination, req.body.company, req.file.originalname], function (error, result) {
        if (error) {
            console.log(error)
            res.render('flightinterface', { message: 'server error' })
        }
        else {

            res.render('flightinterface', { message: 'record submitted successfully' })
        }
    })
})

router.get('/searchbyid', function (req, res) {

    pool.query("select F.*,(select C.cityname from cities C where C.cityid = F.sourcecity)as source,(select C.cityname from cities C where C.cityid = F.destinationcity)as destination from flightdetails F where flightid = ?", [req.query.fid], function (error, result) {
        if (error) {
            res.render('flightbyid', { data: [], message: 'server error' })
        }
        else {
            res.render('flightbyid', { data: result[0], message: 'success' })
        }
    })

})

router.get('/searchbyidforimages', function (req, res) {

    pool.query("select F.*,(select C.cityname from cities C where C.cityid = F.sourcecity)as source,(select C.cityname from cities C where C.cityid = F.destinationcity)as destination from flightdetails F where flightid = ?", [req.query.fid], function (error, result) {
        if (error) {
            res.render('showimages', { data: [], message: 'server error' })
        }
        else {
            res.render('showimages', { data: result[0], message: 'success' })
        }
    })

})

router.post('/flight_Edit_Delete', function (req, res) {
    if (req.body.btn == "Edit") {
        var days = (" " + req.body.days).replaceAll("'", '"')
        pool.query("update  flightdetails  set flightname=?, types=?, totalseats=?, days=?, sourcecity=?, arrivaltime=?, departuretime=?, destinationcity=?, company=? where flightid=?", [req.body.flightname, req.body.flighttype, req.body.noofseats, days, req.body.sourcecity, req.body.arrival, req.body.departure, req.body.destinationcity, req.body.company, req.body.flightid], function (error, result) {
            if (error) {

                res.redirect('/flight/displayallflights')
            }
            else {
                res.redirect('/flight/displayallflights')
            }
        })
    }
    else {
        pool.query("delete from  flightdetails where flightid=?", [req.body.flightid], function (error, result) {
            if (error) {

                res.redirect('/flight/displayallflights')
            }
            else {
                res.redirect('/flight/displayallflights')
            }
        })
    }
})


router.post('/editimage', upload.single('logo'), function (req, res) {

    pool.query("update flightdetails set logo =? where flightid = ?", [req.file.originalname, req.body.flightid], function (error, result) {
        if (error) {

            res.redirect('/flight/displayallflights')
        }
        else {

            res.redirect('/flight/displayallflights')
        }
    })
})




router.get('/fetchallcities', function (req, res) {
    pool.query("select * from cities", function (error, result) {
        if (error) {
            res.status(500).json({ 'result': [], message: 'server error' })
        }
        else {
            res.status(200).json({ result: result, message: 'success' })
        }
    })
})

module.exports = router;
