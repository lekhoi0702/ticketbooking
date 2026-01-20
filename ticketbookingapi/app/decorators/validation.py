"""
Validation decorators using Marshmallow schemas
"""

from functools import wraps
from flask import request, jsonify
from marshmallow import Schema, ValidationError as MarshmallowValidationError
from app.exceptions import ValidationException, BadRequestException


def validate_json(f):
    """
    Decorator to ensure request has JSON content type and body
    
    Usage:
        @app.route('/api/users', methods=['POST'])
        @validate_json
        def create_user():
            data = request.json
            ...
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.is_json:
            raise BadRequestException('Content-Type must be application/json')
        
        if request.json is None:
            raise BadRequestException('Request body must contain valid JSON')
        
        return f(*args, **kwargs)
    
    return decorated_function


def validate_schema(schema: Schema, location: str = 'json'):
    """
    Decorator to validate request data against Marshmallow schema
    
    Args:
        schema: Marshmallow schema class or instance
        location: Where to get data from ('json', 'args', 'form')
    
    Usage:
        @app.route('/api/login', methods=['POST'])
        @validate_schema(LoginSchema())
        def login():
            # request.validated_data contains validated data
            data = request.validated_data
            ...
    
    The validated data is stored in request.validated_data
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get data based on location
            if location == 'json':
                if not request.is_json:
                    raise BadRequestException('Content-Type must be application/json')
                data = request.json or {}
            elif location == 'args':
                data = request.args.to_dict()
            elif location == 'form':
                data = request.form.to_dict()
            else:
                raise ValueError(f"Invalid location: {location}")
            
            # Validate data
            try:
                # If schema is a class, instantiate it
                schema_instance = schema() if isinstance(schema, type) else schema
                validated_data = schema_instance.load(data)
                
                # Store validated data in request context
                request.validated_data = validated_data
                
            except MarshmallowValidationError as e:
                # Convert Marshmallow errors to our ValidationException
                raise ValidationException(errors=e.messages)
            
            return f(*args, **kwargs)
        
        return decorated_function
    
    return decorator


def validate_query_params(schema: Schema):
    """
    Decorator specifically for validating query parameters
    
    Usage:
        @app.route('/api/events', methods=['GET'])
        @validate_query_params(EventFilterSchema())
        def get_events():
            filters = request.validated_data
            ...
    """
    return validate_schema(schema, location='args')


def validate_request_and_response(
    request_schema: Schema,
    response_schema: Schema = None,
    many: bool = False
):
    """
    Decorator to validate both request and response
    
    Args:
        request_schema: Schema for request validation
        response_schema: Schema for response serialization
        many: Whether response is a list
    
    Usage:
        @app.route('/api/users', methods=['POST'])
        @validate_request_and_response(
            request_schema=UserCreateSchema(),
            response_schema=UserSchema()
        )
        def create_user():
            data = request.validated_data
            user = create_user_logic(data)
            return user  # Will be automatically serialized
    """
    def decorator(f):
        @wraps(f)
        @validate_schema(request_schema)
        def decorated_function(*args, **kwargs):
            # Execute function
            result = f(*args, **kwargs)
            
            # If response schema provided, serialize response
            if response_schema:
                # Handle different return types
                if isinstance(result, tuple):
                    # (data, status_code) or (data, status_code, headers)
                    data = result[0]
                    rest = result[1:]
                else:
                    data = result
                    rest = ()
                
                # Serialize data
                schema_instance = response_schema() if isinstance(response_schema, type) else response_schema
                serialized = schema_instance.dump(data, many=many)
                
                # Return with original status/headers if provided
                if rest:
                    return (serialized, *rest)
                else:
                    return serialized
            
            return result
        
        return decorated_function
    
    return decorator
