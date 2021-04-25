import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/api/decorators/get-user.decorator';
import { User } from 'src/domain/entities/user.entity';
import { CreateTaskDto } from '../../../domain/tasks/dto/create-task.dto';
import { GetTasksFilterDto } from '../../../domain/tasks/dto/get-tasks-filter.dto';
import { TaskStatusValidationPipe } from '../../pipes/task-status-validation.pipe';
import { TaskStatus } from '../../../domain/tasks/dto/task-status.enum';
import { Task } from '../../../domain/entities/task.entity';
import { TasksService } from '../../../domain/tasks/service/tasks.service';

// Controller 데코레이터 (어떤 경로를 처리해야하는지 알려줌)
@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
  private logger = new Logger('TaskController');
  constructor(private tasksService: TasksService) {}

  @Get() // GET /tasks or /tasks?status=OPEN&search=hello
  getTasks(@Query(ValidationPipe) filterDto: GetTasksFilterDto, @GetUser() user: User) {
    this.logger.verbose(`User "${user.username}" retrieving all tasks. Filters: ${JSON.stringify(filterDto)}`);
    return this.tasksService.getTasks(filterDto, user);
  }

  @Get('/:id') // GET /tasks/1
  getTaskById(@Param('id', ParseIntPipe) id: number, @GetUser() user: User): Promise<Task> {
    return this.tasksService.getTaskById(id, user);
  }

  @Post() // POST /tasks (x-www-form-urlencoded/ title, description)
  @UsePipes(ValidationPipe)
  createTask(@Body() createTaskDto: CreateTaskDto, @GetUser() user: User): Promise<Task> {
    this.logger.verbose(`User "${user.username}" creating a new task. Data: ${JSON.stringify(createTaskDto)}`);
    return this.tasksService.createTask(createTaskDto, user);
  }

  @Delete('/:id')
  deleteTask(@Param('id', ParseIntPipe) id: number, @GetUser() user: User): Promise<void> {
    return this.tasksService.deleteTask(id, user);
  }

  @Patch('/:id/status')
  patchTask(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', TaskStatusValidationPipe) status: TaskStatus,
    @GetUser() user: User,
  ): Promise<Task> {
    return this.tasksService.updateTaskStatus(id, status, user);
  }
}
