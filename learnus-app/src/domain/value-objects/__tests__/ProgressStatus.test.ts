import { ProgressStatus } from '../ProgressStatus';

describe('ProgressStatus', () => {
  describe('create', () => {
    it('should create valid progress status', () => {
      const status = ProgressStatus.create('not_started');
      expect(status.isSuccess).toBe(true);
      expect(status.getValue().value).toBe('not_started');
    });

    it('should create in_progress status', () => {
      const status = ProgressStatus.create('in_progress');
      expect(status.isSuccess).toBe(true);
      expect(status.getValue().value).toBe('in_progress');
    });

    it('should create completed status', () => {
      const status = ProgressStatus.create('completed');
      expect(status.isSuccess).toBe(true);
      expect(status.getValue().value).toBe('completed');
    });

    it('should fail with invalid status', () => {
      const status = ProgressStatus.create('invalid' as any);
      expect(status.isFailure).toBe(true);
      expect(status.getError().message).toBe('Invalid progress status');
    });
  });

  describe('static factory methods', () => {
    it('should create not started status', () => {
      const status = ProgressStatus.notStarted();
      expect(status.value).toBe('not_started');
      expect(status.isNotStarted()).toBe(true);
    });

    it('should create in progress status', () => {
      const status = ProgressStatus.inProgress();
      expect(status.value).toBe('in_progress');
      expect(status.isInProgress()).toBe(true);
    });

    it('should create completed status', () => {
      const status = ProgressStatus.completed();
      expect(status.value).toBe('completed');
      expect(status.isCompleted()).toBe(true);
    });
  });

  describe('state checks', () => {
    it('should correctly identify not started state', () => {
      const status = ProgressStatus.notStarted();
      expect(status.isNotStarted()).toBe(true);
      expect(status.isInProgress()).toBe(false);
      expect(status.isCompleted()).toBe(false);
    });

    it('should correctly identify in progress state', () => {
      const status = ProgressStatus.inProgress();
      expect(status.isNotStarted()).toBe(false);
      expect(status.isInProgress()).toBe(true);
      expect(status.isCompleted()).toBe(false);
    });

    it('should correctly identify completed state', () => {
      const status = ProgressStatus.completed();
      expect(status.isNotStarted()).toBe(false);
      expect(status.isInProgress()).toBe(false);
      expect(status.isCompleted()).toBe(true);
    });
  });

  describe('state transitions', () => {
    it('should allow starting from not started', () => {
      const status = ProgressStatus.notStarted();
      expect(status.canStart()).toBe(true);
      
      const result = status.start();
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isInProgress()).toBe(true);
    });

    it('should not allow starting from in progress', () => {
      const status = ProgressStatus.inProgress();
      expect(status.canStart()).toBe(false);
      
      const result = status.start();
      expect(result.isFailure).toBe(true);
    });

    it('should not allow starting from completed', () => {
      const status = ProgressStatus.completed();
      expect(status.canStart()).toBe(false);
      
      const result = status.start();
      expect(result.isFailure).toBe(true);
    });

    it('should allow completing from in progress', () => {
      const status = ProgressStatus.inProgress();
      expect(status.canComplete()).toBe(true);
      
      const result = status.complete();
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isCompleted()).toBe(true);
    });

    it('should not allow completing from not started', () => {
      const status = ProgressStatus.notStarted();
      expect(status.canComplete()).toBe(false);
      
      const result = status.complete();
      expect(result.isFailure).toBe(true);
    });

    it('should not allow completing from completed', () => {
      const status = ProgressStatus.completed();
      expect(status.canComplete()).toBe(false);
      
      const result = status.complete();
      expect(result.isFailure).toBe(true);
    });

    it('should allow restarting from completed', () => {
      const status = ProgressStatus.completed();
      expect(status.canRestart()).toBe(true);
      
      const result = status.restart();
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isNotStarted()).toBe(true);
    });

    it('should not allow restarting from not started', () => {
      const status = ProgressStatus.notStarted();
      expect(status.canRestart()).toBe(false);
      
      const result = status.restart();
      expect(result.isFailure).toBe(true);
    });

    it('should not allow restarting from in progress', () => {
      const status = ProgressStatus.inProgress();
      expect(status.canRestart()).toBe(false);
      
      const result = status.restart();
      expect(result.isFailure).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return correct Russian text for not started', () => {
      const status = ProgressStatus.notStarted();
      expect(status.toString()).toBe('Не начато');
    });

    it('should return correct Russian text for in progress', () => {
      const status = ProgressStatus.inProgress();
      expect(status.toString()).toBe('В процессе');
    });

    it('should return correct Russian text for completed', () => {
      const status = ProgressStatus.completed();
      expect(status.toString()).toBe('Завершено');
    });
  });
});