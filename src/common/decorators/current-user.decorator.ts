import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ITourismRecommenderRequest } from '../types/tourism-recommender-request.interface';

export const CurrentUser = createParamDecorator(
  (_: never, context: ExecutionContext) => {
    const request = context
      .switchToHttp()
      .getRequest<ITourismRecommenderRequest>();
    return request?.currentUser;
  },
);
