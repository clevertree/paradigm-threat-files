import 'reflect-metadata';
import pg from 'pg';
import {Column, DataType, Model, Sequelize, Table, Unique} from 'sequelize-typescript';
import {InferAttributes, InferCreationAttributes} from "sequelize";

/** Models **/

@Table({
    tableName: 'files',
    timestamps: true,
})
export class FileModel extends Model<InferAttributes<FileModel>, InferCreationAttributes<FileModel>> {
    @Unique
    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    path!: string;

    @Column({
        type: DataType.STRING(1024),
        allowNull: false,
    })
    blurDataURL!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    format!: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    width!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    height!: number;
}

/** Instance **/


// Initialize the database connection
let sequelize: Sequelize | undefined;

export async function ensureDatabase() {
    if (sequelize)
        return sequelize
    console.log('Ensuring database connection...');
    try {
        sequelize = new Sequelize(process.env.POSTGRES_URL || '', {
            dialectOptions: {
                ssl: process.env.NODE_ENV === 'production' ? {
                    require: true,
                    rejectUnauthorized: false,
                } : false,
            },
            dialect: 'postgres',
            dialectModule: pg,
            models: [FileModel],
            logging: false,
        });

        await sequelize.authenticate();
        // await sequelize.sync();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
}


/** Callbacks **/

export async function upsertImage(path: string, width: number, height: number, format: string, blurDataURL: string) {
    await ensureDatabase();
    return FileModel.upsert({
        path,
        width,
        format,
        height,
        blurDataURL
    });
}

//
// export async function getChannelPosts(channelName: string, limit: number = 25): Promise<Array<PostModel>> {
//     await ensureDatabase();
//     return PostModel.findAll({
//         include: [
//             {
//                 model: ChannelModel,
//                 where: { name: channelName },
//                 attributes: []
//             },
//             {
//                 model: UserModel,
//                 attributes: ['username', 'email']
//             }
//         ],
//         order: [['created', 'DESC']],
//         limit,
//         raw: true,
//         nest: true
//     });
// }
//
// export async function getChannelInfo(channelName: string): Promise<ChannelModel> {
//     await ensureDatabase();
//     const channel = await ChannelModel.findOne({
//         where: { name: channelName },
//         raw: true
//     });
//
//     if (!channel) {
//         throw new Error(`Channel ${channelName} not found`);
//     }
//
//     return channel;
// }
//
// export async function getChannelList(): Promise<Array<ChannelModel>> {
//     await ensureDatabase();
//     return await ChannelModel.findAll({
//         raw: true
//     });
// }
//
// export async function insertChannel({
//                                         name,
//                                         description,
//                                     }: Omit<ChannelModel, 'id'>): Promise<ChannelModel> {
//     await ensureDatabase();
//     const [channel] = await ChannelModel.upsert({
//         name,
//         description
//     }, {
//         returning: true
//     });
//
//     return channel.get({ plain: true });
// }
//
// export async function insertUser(upsertInfo: {
//     username: string,
//     full_name?: string,
//     email?: string,
// }): Promise<UserModel> {
//     await ensureDatabase();
//     const [user] = await UserModel.upsert(upsertInfo, {
//         returning: true
//     });
//
//     return user.get({ plain: true });
// }
//
// export async function getUserModel(username: string): Promise<UserModel | null> {
//     await ensureDatabase();
//     return await UserModel.findOne({
//         where: {username},
//         raw: true
//     });
// }
//
// export async function getOrCreateUserInfo(username: string): Promise<UserModel> {
//     await ensureDatabase();
//     let userInfo = await getUserModel(username);
//     if (!userInfo) {
//         userInfo = await insertUser({ username });
//     }
//     return userInfo;
// }
//
// export async function insertPost(insertData: {
//     user_id: number,
//     channel_id: number,
//     content: string,
//     created: string,
// }): Promise<PostModel> {
//     await ensureDatabase();
//     const post = await PostModel.create(insertData);
//
//     const postWithRelations = await PostModel.findOne({
//         where: { id: post.id },
//         include: [
//             {
//                 model: UserModel,
//                 attributes: ['username']
//             },
//             {
//                 model: ChannelModel,
//                 attributes: ['name']
//             }
//         ],
//         raw: true,
//         nest: true
//     });
//
//     if (!postWithRelations) {
//         throw new Error("Unable to insert post: " + post.id);
//     }
//
//     return postWithRelations;
//
//     // return {
//     //     ...postWithRelations,
//     //     username: (postWithRelations as any)['user.username'],
//     //     channel_name: (postWithRelations as any)['channel.name']
//     // };
// }
//
// export async function deletePost(id: number): Promise<void> {
//     await ensureDatabase();
//     const deletedCount = await PostModel.destroy({
//         where: { id }
//     });
//
//     if (deletedCount === 0) {
//         throw new Error("Failed to delete post id " + id);
//     }
// }