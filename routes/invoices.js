//Routes for invoices

const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) =>{
    try{
        const results = await db.query(
            `SELECT id, comp_code 
            FROM invoices
            ORDER BY comp_code`);

        return res.json({ "invoices": results.rows })
    } catch(e){
        return next(e)
    }
})

router.get('/:id', async (req, res, next) => {
    try{
        const { id } = req.params;

        const results = await db.query(
            `SELECT id, comp_code, amt, paid, add_date, paid_date, c.name, c.description 
            FROM invoices
            INNER JOIN companies AS c ON comp_code=c.code
            WHERE id=$1`, [id]);
        
        const data = results.rows[0];
        const invoice = {
            id: data.id,
            company: {
                code: data.comp_code,
                name: data.name,
                description: data.description,
            },
            amt: data.amt,
            paid: data.paid,
            add_date: data.add_date,
            paid_date: data.paid_date,
        };

        return res.json({ "invoice": invoice })
    } catch(e){
        return next(e)
    }
})

router.post('/', async (req, res, next) =>{
    try{
        const { comp_code, amt } = req.body;

        const results = await db.query(
            `INSERT INTO invoices (comp_code, amt)
            VALUES ($1, $2) 
            RETURNING (id, comp_code, amt, paid, add_date, paid_date)`, [comp_code, amt]);

        return res.status(201).json({ "invoice": results.rows[0] })
    } catch(e){
        return next(e)
    }
})

router.patch('/:id', async (req, res, next) =>{
    try{
        const { id } = req.params;
        const { amt } = req.body;

        const results = await db.query(
            `UPDATE invoices
            SET amt=$1
            WHERE id=$2
            RETURNING (id, comp_code, amt, paid, add_date, paid_date)`, [amt, id]);

            return res.json({ "invoice": results.rows[0] })
    } catch(e){
        return next(e)
    }
})

router.delete('/:id', async (req, res, next) =>{
    try{
        const { id } = req.params;

        const results = db.query(
            `DELETE FROM invoices
            WHERE id=$1`, [id]);

        return res.send({ msg: "Deleted" })
    } catch(e){
        return next(e)
    }
})


module.exports = router;