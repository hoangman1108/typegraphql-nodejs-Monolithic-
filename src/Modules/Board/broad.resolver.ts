import { CreateQuery, Schema } from 'mongoose';
import { Logger } from 'pino';
import {
  Arg, Ctx, Extensions, Mutation, Query, Resolver,
} from 'type-graphql';
import { IBoard } from '../../models/board.model';
import { IUser } from '../../models/user.model';
import { ObjectIdScalar } from '../../Scalars/ObjectIdScalars';
import BoardService from '../../services/board.service';
import {
  BoardInput, FindBoardInput, IdBoardInput, PublishBoardInput,
} from './type/board.input';

import {
  BoardPayload, BoardPayloads, DeleteBoardPayload, JoinedPayload,
} from './type/board.type';

@Resolver()
export class BoardResolver {
  @Mutation(() => BoardPayload)
  @Extensions({
    authenticate: true,
  })
  async createBoard(@Arg('data') data: BoardInput,
    @Ctx() {
      boardService, user, logger,
    }: {
      boardService: BoardService;
      user: IUser;
      logger: Logger;
    }): Promise<BoardPayload> {
    const input: CreateQuery<IBoard> = {
      title: data.title,
      date: new Date(),
      user: <Schema.Types.ObjectId>user.id,
    };
    const create: IBoard = await boardService.create(input);
    logger.info('BoardMutation#create.check %o', create);
    const board: any  = {
      ...create.toObject(),
      id: ObjectIdScalar.parseValue(create.id),
    };
    return {
      board,
      errors: null,
    };
  }

  @Query(() => BoardPayloads)
  @Extensions({
    authenticate: true,
  })
  async listBoard(@Arg('data') find: FindBoardInput,
    @Ctx() {
      boardService, logger,
    }: {
      boardService: BoardService;
      logger: Logger;
    }): Promise<BoardPayloads> {
    const list: any = await boardService.list(find);
    logger.info('BoardQuery#list.check %o', list);
    let results: any = null;

    if (list) {
      results = list.map((board: IBoard) => ({
        ...board,
        id: ObjectIdScalar.parseValue(board.id),
      }));
    }
    return {
      boards: results,
      errors: null,
    };
  }

  @Mutation(() => DeleteBoardPayload)
  @Extensions({
    authenticate: true,
  })
  async deleteBoard(@Arg('data') id: IdBoardInput,
    @Ctx() {
      boardService, logger,
    }: {
      boardService: BoardService;
      logger: Logger;
    }) {
    const deleted: string = await boardService.deleteBoard(id);
    logger.info('BoardMutation#delete.check %o', deleted);
    return {
      board: deleted,
      errors: null,
    };
  }

  @Mutation(() => JoinedPayload)
  @Extensions({
    authenticate: true,
  })
  async joinedBoard(@Arg('data') data: PublishBoardInput,
    @Ctx() {
      boardService, logger, user,
    }: {
      boardService: BoardService;
      logger: Logger;
      user: IUser;
    }): Promise<JoinedPayload> {
    data.joiner = user.id;
    const board = await boardService.update(data);
    logger.info('BoardMutation#update.check %o', board);
    return {
      board: 'OK',
      errors: null,
    };
  }
}
