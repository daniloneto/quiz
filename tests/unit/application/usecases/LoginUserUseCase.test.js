import LoginUserUseCase from '../../../../src/application/usecases/LoginUserUseCase';

describe('LoginUserUseCase', () => {
  let useCase;
  let mockAuthRepository;
  let mockPasswordService;
  let mockJwtService;
  
  beforeEach(() => {
    mockAuthRepository = {
      findUserByUsername: jest.fn(),
      findProfileById: jest.fn(),
      updateLastLogin: jest.fn()
    };
    
    mockPasswordService = {
      verify: jest.fn()
    };
    
    mockJwtService = {
      sign: jest.fn()
    };
    
    useCase = new LoginUserUseCase({
      authRepository: mockAuthRepository,
      passwordService: mockPasswordService,
      jwtService: mockJwtService
    });
  });
  
  test('should throw error when user is not found', async () => {
    // Arrange
    const params = {
      username: 'nonexistent',
      password: 'password',
      loginType: 'user'
    };
    
    mockAuthRepository.findUserByUsername.mockResolvedValue(null);
    
    // Act & Assert
    await expect(useCase.execute(params))
      .rejects
      .toThrow('Usuário e/ou senha incorreta.');
  });
  
  test('should throw error when account is not activated', async () => {
    // Arrange
    const userId = '123';
    const params = {
      username: 'testuser',
      password: 'password',
      loginType: 'user'
    };
    
    const mockUser = {
      _id: userId,
      password: 'hashedPassword'
    };
    
    const mockProfile = {
      ativado: false
    };
    
    mockAuthRepository.findUserByUsername.mockResolvedValue(mockUser);
    mockAuthRepository.findProfileById.mockResolvedValue(mockProfile);
    
    // Act & Assert
    await expect(useCase.execute(params))
      .rejects
      .toThrow('Conta não foi ativada ainda, verifique seu e-mail.');
  });
  
  test('should throw error when non-admin tries to access admin area', async () => {
    // Arrange
    const userId = '123';
    const params = {
      username: 'testuser',
      password: 'password',
      loginType: 'admin'
    };
    
    const mockUser = {
      _id: userId,
      password: 'hashedPassword'
    };
    
    const mockProfile = {
      ativado: true,
      adm: false
    };
    
    mockAuthRepository.findUserByUsername.mockResolvedValue(mockUser);
    mockAuthRepository.findProfileById.mockResolvedValue(mockProfile);
    
    // Act & Assert
    await expect(useCase.execute(params))
      .rejects
      .toThrow('Você não tem permissão suficiente.');
  });
  
  test('should throw error when password is incorrect', async () => {
    // Arrange
    const userId = '123';
    const params = {
      username: 'testuser',
      password: 'wrongpassword',
      loginType: 'user'
    };
    
    const mockUser = {
      _id: userId,
      password: 'hashedPassword'
    };
    
    const mockProfile = {
      ativado: true,
      adm: false
    };
    
    mockAuthRepository.findUserByUsername.mockResolvedValue(mockUser);
    mockAuthRepository.findProfileById.mockResolvedValue(mockProfile);
    mockPasswordService.verify.mockResolvedValue(false);
    
    // Act & Assert
    await expect(useCase.execute(params))
      .rejects
      .toThrow('Usuário e/ou senha incorreta.');
  });
  
  test('should login successfully', async () => {
    // Arrange
    const userId = '123';
    const params = {
      username: 'testuser',
      password: 'correctpassword',
      loginType: 'user'
    };
    
    const mockUser = {
      _id: userId,
      password: 'hashedPassword'
    };
    
    const mockProfile = {
      ativado: true,
      adm: false
    };
    
    const mockToken = 'jwt-token';
    const expiresAt = new Date(Date.now() + 3600000);
    
    mockAuthRepository.findUserByUsername.mockResolvedValue(mockUser);
    mockAuthRepository.findProfileById.mockResolvedValue(mockProfile);
    mockPasswordService.verify.mockResolvedValue(true);
    mockJwtService.sign.mockReturnValue(mockToken);
    
    // Act
    const result = await useCase.execute(params);
    
    // Assert
    expect(mockAuthRepository.findUserByUsername).toHaveBeenCalledWith(params.username);
    expect(mockAuthRepository.findProfileById).toHaveBeenCalledWith(userId);
    expect(mockPasswordService.verify).toHaveBeenCalledWith(mockUser.password, params.password);
    expect(mockAuthRepository.updateLastLogin).toHaveBeenCalledWith(userId, expect.any(Date));
    expect(mockJwtService.sign).toHaveBeenCalledWith({ userId: userId.toString() }, { expiresIn: '1h' });
    expect(result).toEqual({
      token: mockToken,
      expiresAt: expect.any(Date),
      uid: userId.toString()
    });
  });
});
