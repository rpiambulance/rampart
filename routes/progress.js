const express = require('express');
const { QueryTypes } = require('sequelize');


module.exports = db => {
    const router = express.Router();

    const checklistItemModel = db.model('checklist_items')
    const userModel = db.model('users')
    const credentialModel = db.model('credentials');
    const userChecklistItemModel = db.model('users_checklist_items');
    const userCredentialModel = db.model('users_credentials')
    const userPermissionModel = db.model('users_permissions')
    const permissionModel = db.model('permissions')

    // start a new route
    router.post('/', async (req, res) =>{
        const result = await checklistItemModel.findAll({
            where: {credential_id: req.body['credential_id'],
                    active: true
            }}).then(async result => {
                result.forEach(async checklist => {
                await userChecklistItemModel.findOne({
                    where:{
                        user_id: req.body['user_id'],
                        checklist_item_id: checklist.id
                    }}).then(async result => {
                        if (!result){
                            await userChecklistItemModel.create(
                                {'user_id': req.body['user_id'],
                                'checklist_item_id': checklist.id,
                                'active': false,
                                'trainer': req.body.trainer,
                                'created_by': req.body.created_by})
                            }
                    })
                })

            await userCredentialModel.create(
                {'user_id': req.body['user_id'],
                'credential_id': req.body['credential_id'],
                'active': false,
                'created_by': req.body.created_by})
        }).then(r => res.send({'isSuccess': true,
                                'msg': 'Successfully start the route'})
        ).catch(r => res.send({'isSuccess': false,
                'msg': 'Fail to start the route'}
        ))
    });

    async function isUserPermittedCheckoff(user_id){
        perm_id = await permissionModel.findOne({
            where: {'name': 'approve'
            }
        }).then(r => r.id)

        is_in = await userPermissionModel.findOne({
                            where: {'permission_id': perm_id,
                                    'user_id': user_id
                        }}).then(r => (r === null) ? false: true)
        return is_in
    }


    // Update users_checklist_items
    router.put('/', async (req, res) => {
        console.log('------>Req Body', req.body)
        is_in = await isUserPermittedCheckoff(req.body.updated_by)
        if (!is_in){
            res.send({
                'isSuccess': false,
                'msg':'You have no right to checkoff the checklist item'}
        )} else {
            await userChecklistItemModel.update(req.body,
                {where: {user_id: req.body['user_id'],
                        checklist_item_id: req.body['checklist_item_id']}}
                ).then((result) => {
                            res.send({'isSuccess': true,
                                    'msg':'User Checklist Item updated successfully'})}
                ).catch((result) => {
                    res.send({'isSuccess': false,
                            'msg':'User Checklist Item is not updated successfully'}
                            )
                })
            }
        }


    )

    //Get Detailed Progress of a Route
    async function getDetailedProgressOfARoute(user_id, credential_id){
        var checklist_items = await checklistItemModel.findAll({
            where: {
                credential_id: credential_id,
                active: true}
            })

        var user_checklists = await userChecklistItemModel.findAll({
                where:{
                    user_id: user_id}
            }).then(result => result.map(r => r.checklist_item_id))

        var finished_user_checklists = await userChecklistItemModel.findAll({
            where:{
                user_id: user_id,
                active: true
            }
        }).then(result => result.map(r => r.checklist_item_id))

        for (let res of checklist_items){
            res.dataValues['isFinished'] = finished_user_checklists.includes(res.id)
            res.dataValues['isStarted'] = user_checklists.includes(res.id)
            if (res.dataValues['isStarted']){
                const comments = await userChecklistItemModel.findOne({
                    where:{
                        user_id: user_id,
                        checklist_item_id: res.id}
                }).then(result => result.comments)

                res.dataValues['comments'] = comments;
            }
            else{
                res.dataValues['comments'] = 'No comments';
            }

            if (!res.dataValues['isFinished']){
                res.dataValues['active'] = false
            }
            if (res.dataValues['isStarted']){
                const update_by_info = await userChecklistItemModel.findOne({
                    where: {user_id: user_id,
                            checklist_item_id: res.id
                    }
                }).then(r => {
                            return {'updated': r.updated,
                                    'updated_by': r.updated_by,
                                    'created': r.created,
                                    'created_by': r.created_by}
                            })

                if (!(update_by_info.updated_by === null)){
                    to_find_user_id = update_by_info.updated_by
                    when_update = update_by_info.updated
                }
                else{
                    to_find_user_id = update_by_info.created_by
                    when_update = update_by_info.created
                }

                const update_user_name = await userModel.findOne({
                    where: {id: to_find_user_id}
                }).then(r => {
                    return {'last_name': r.last_name,
                            'first_name': r.first_name}
                })
                res.dataValues['updatedByName'] = update_user_name;
                res.dataValues['updated'] = when_update;
                res.dataValues['updated_by'] = to_find_user_id;
            }
        }

        return checklist_items
    }

    // Get the status of a START route, include the status of all checklist_items
    router.get('/start/:userId&:credentialId', async (req, res) => {
        getDetailedProgressOfARoute(req.params.userId,
                                    req.params.credentialId).then(r => res.send(r))
    });

    // Determine whether route update availability
    async function isPrerequistAvailable(user_id, credential_id){
        var parent_cred = await credentialModel.findOne({
            where: {id: credential_id}
        }).then(result =>  result.parent_cred)

        var all_user_credentials = await userCredentialModel.findAll({
            where: {user_id: user_id,
                    active: true}
        }).then(result => result.map(item => item.credential_id));
        return all_user_credentials.includes(parent_cred)
    }

    router.get('/available/:userId&:credentialId', async(req, res) =>{

        const isAvailable = isPrerequistAvailable(req.params.userId,
                                                  req.params.credentialId)
        if (!isAvailable){
            res.send({'isAvailable': false,
                    'msg': 'parent credential doesn\'t exist'})
        }
        else{
            res.send({'isAvailable': true,
                      'msg': 'parent credential exist'})
        }
    })

    async function getUserCredentialStatus(user_id, credential_id){

        const is_complete = await userCredentialModel.findOne({
            where: {user_id: user_id,
                    credential_id: credential_id,
                    active: true}
        }).then(r => r ? true: false)

        const user_name = await userModel.findOne({where: {id: user_id}})
        const credential_name = await credentialModel.findOne({where: {id: credential_id}}).then(r => r.name)

        const is_available = await isPrerequistAvailable(user_id,
            credential_id)
        const checklist_items = await getDetailedProgressOfARoute(user_id,
                                                                  credential_id)

        const checklist_starts_num = checklist_items.map(r => r.dataValues.isStarted ? 1: 0).reduce(
                                                                                    (a, b) => a + b, 0)

        const checklist_finishes_num = checklist_items.map(r => r.dataValues.isFinished ? 1: 0).reduce(
                                                                                    (a, b) => a + b, 0)

        checklist_num = checklist_items.length

        is_started = (checklist_starts_num == checklist_num)
        is_checklistItems_finished = checklist_finishes_num == checklist_num

        if (is_complete){
            label = 'Compeleted'
        }
        else if (!is_available){
            label = 'Not available'
        }
        else if (is_started & (!is_checklistItems_finished)){
            label = 'In Progress'
        }
        else if (is_started & is_checklistItems_finished){
            label = 'started'
        }
        else{
            label = 'Not start'
        }
        status = {'finishedChecklistNum': checklist_finishes_num,
                  'totalChecklistItemNum': checklist_num,
                  'isAvailable': is_available,
                  'isStarted': checklist_starts_num == checklist_num,
                  'isChecklistItemsFinished': checklist_finishes_num == checklist_num,
                  'isCompleted': is_complete,
                  'checklist_items': checklist_items,
                  'user_id': user_id,
                  'last_name': user_name.last_name,
                  'first_name': user_name.first_name,
                  'email': user_name.email,
                  'credential_id': credential_id,
                  'credential_name': credential_name,
                  'label': label
                 }

        return status;
    }
    router.get('/:userId&:credentialId', async (req, res) => {
        const status = await getUserCredentialStatus(req.params.userId,
                                               req.params.credentialId)
        res.send(status);
    })

    router.get('/all/:userId', async (req, res) => {

        all_status = []
        const all_credentials = await credentialModel.findAll()
        for (let cred of all_credentials){
            status = await getUserCredentialStatus(req.params.userId, cred.id)
            all_status.push(status)
        }
        res.send(all_status)
    })

    router.get('/all/', async (req, res) => {

        all_status = []
        const user_credentials = await userCredentialModel.findAll()
        for (let user_cred of user_credentials){
            status = await getUserCredentialStatus(user_cred.user_id, user_cred.credential_id)
            all_status.push(status)
        }
        res.send(all_status)
    })


    return router;
};
