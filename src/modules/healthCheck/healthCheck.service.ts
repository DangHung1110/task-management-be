import {ResponseStatus, ServiceResponse} from '../../common/dtos/serviceResponse.dto';
import { StatusCodes } from 'http-status-codes';

export class healthCheckService {
    async checkHealth(): Promise<ServiceResponse<null>> {
        return new ServiceResponse(
            ResponseStatus.Success,
            "Health check successful",
            null,
            StatusCodes.OK
        );
    }
}
